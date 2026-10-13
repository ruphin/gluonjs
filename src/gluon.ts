/**
 * @license
 * Copyright (c) 2026 Goffert van Gool
 * SPDX-License-Identifier: MIT
 */

import { render, noChange } from "lite-html";

import {
  type PropertyDeclaration,
  type PropertyDeclarations,
  type PropertyValues,
  defaultConverter,
  notEqual,
  attributeName,
} from "./properties.js";
import {
  type StyleSheet,
  type Styles,
  toStyleSheet,
  toCSSText,
} from "./styles.js";

type Properties = Record<string, unknown>;
type GluonConstructor = typeof GluonElement;

// What is known about an element class, computed once from its static `properties` and `styles`
interface ClassInfo {
  // The declared properties, including the ones declared by superclasses
  properties: Map<string, PropertyDeclaration>;
  // The observed attributes, mapped to the names of their properties
  attributes: Map<string, string>;
  // The styles of the class, flattened to a list
  styles?: readonly StyleSheet[];
}

const classInfos = new WeakMap<GluonConstructor, ClassInfo>();
// The setters that `defineAccessor` created, so a property is not made reactive twice
const reactiveSetters = new WeakSet<(value: unknown) => void>();

/**
 * Makes a declared property reactive
 *
 * The property is an accessor on the prototype, declared with the `accessor` keyword or a getter and setter pair,
 * or on the prototype of a superclass. When there is none, an accessor with its own storage is created.
 * The setter is wrapped so it requests an update when the value changes.
 */
const defineAccessor = (prototype: object, name: string): void => {
  let descriptor: PropertyDescriptor | undefined;
  for (
    let object = prototype;
    object !== GluonElement.prototype && !descriptor;
    object = Object.getPrototypeOf(object)
  ) {
    descriptor = Object.getOwnPropertyDescriptor(object, name);
  }
  if (descriptor?.set && reactiveSetters.has(descriptor.set)) {
    return;
  }
  const key = Symbol(name);
  const get =
    descriptor?.get ??
    function (this: Properties) {
      return this[key as unknown as string];
    };
  const set =
    descriptor?.set ??
    function (this: Properties, value: unknown) {
      this[key as unknown as string] = value;
    };
  const reactiveSet = function (this: GluonElement, value: unknown) {
    const oldValue = get.call(this);
    set.call(this, value);
    this.requestUpdate(name, oldValue);
  };
  reactiveSetters.add(reactiveSet);
  Object.defineProperty(prototype, name, {
    get,
    set: reactiveSet,
    configurable: true,
    enumerable: true,
  });
};

/**
 * Computes the class info of an element class, once
 *
 * Classes inherit the declared properties of their superclasses, and make their own declared properties reactive
 */
const finalize = (ctor: GluonConstructor): ClassInfo => {
  let info = classInfos.get(ctor);
  if (info) {
    return info;
  }
  const inherited =
    ctor === GluonElement ? undefined : finalize(Object.getPrototypeOf(ctor));
  info = {
    properties: new Map(inherited?.properties),
    attributes: new Map(inherited?.attributes),
  };
  classInfos.set(ctor, info);
  if (Object.hasOwn(ctor, "properties")) {
    for (const [name, declaration] of Object.entries(ctor.properties)) {
      info.properties.set(name, declaration);
      for (const [attribute, property] of info.attributes) {
        if (property === name) {
          info.attributes.delete(attribute);
        }
      }
      const attribute = attributeName(name, declaration);
      if (attribute) {
        info.attributes.set(attribute, name);
      }
      defineAccessor(ctor.prototype, name);
    }
  }
  return info;
};

const getStyles = (ctor: GluonConstructor): readonly StyleSheet[] => {
  const info = finalize(ctor);
  return (info.styles ??= ([] as StyleSheet[]).concat(ctor.styles ?? []));
};

/**
 * Registers an element class with a custom element registry, under the tag name `name`
 */
export const define = <T extends GluonConstructor>(
  ctor: T,
  name: string,
  registry: CustomElementRegistry = customElements,
): T => {
  registry.define(name, ctor);
  return ctor;
};

/**
 * A base class for custom elements
 *
 * - Declares reactive properties in a static `properties` map, with attributes that are converted and reflected
 * - Renders the result of `render()` with lite-html into a shadow root, batched in a microtask after properties change
 * - Applies the static `styles` to the shadow root, once per class
 * - Calls event handlers in the template with the element as `this`
 */
export class GluonElement extends HTMLElement {
  /**
   * The reactive properties of this element, by name
   *
   * Each declared property is an accessor that requests an update when its value changes.
   * With `attribute: true`, the property is also set from the attribute with its kebab-cased name.
   */
  static properties: PropertyDeclarations = {};

  /**
   * The styles of this element: CSS text, a constructed `CSSStyleSheet`, or a list of them
   *
   * The styles are applied to the shadow root of every instance, once per class.
   * They are not applied when the element renders into its light DOM.
   */
  static styles?: Styles;

  /**
   * The options for the shadow root that `createRenderRoot()` attaches
   */
  static shadowRootOptions: ShadowRootInit = { mode: "open" };

  static get observedAttributes(): string[] {
    return [...finalize(this).attributes.keys()];
  }

  /**
   * The node that `render()` renders into. A shadow root, unless `createRenderRoot()` is overridden
   */
  readonly renderRoot: ParentNode;

  /**
   * Whether an update is scheduled and has not been performed yet
   */
  isUpdatePending = false;

  /**
   * Whether the element has performed its first update
   */
  hasUpdated = false;

  // The properties that changed since the last update, with their previous values
  #changed = new Map<string, unknown>();
  // The properties that are reflected to their attributes in the next update
  #reflecting = new Set<string>();
  // The property that is being synchronised with its attribute, to stop the attribute from being read back
  #reflectingProperty: string | undefined;
  // Resolves when the pending update completes, with `true` when no further update is pending
  #updatePromise: Promise<boolean>;
  // Resolves the promise that the first update waits for, called and cleared on the first connect
  #enableUpdating?: (value: boolean) => void;
  // The styles that are added as a `<style>` element after the first render, when stylesheets cannot be adopted
  #styleText: string | undefined;
  // Aborted when the element is disconnected
  #disconnect = new AbortController();

  constructor() {
    super();
    finalize(this.constructor as GluonConstructor);
    this.#updatePromise = new Promise(
      (resolve) => (this.#enableUpdating = resolve),
    );
    this.renderRoot = this.createRenderRoot();
    this.#adoptStyles();
    this.requestUpdate();
  }

  /**
   * Returns the node to render into
   *
   * Attaches a shadow root with the static `shadowRootOptions`, or returns the shadow root that already exists.
   * Override this method to render somewhere else, for example `return this` to render into the light DOM.
   */
  protected createRenderRoot(): ParentNode {
    return (
      this.shadowRoot ??
      this.attachShadow(
        (this.constructor as GluonConstructor).shadowRootOptions,
      )
    );
  }

  /**
   * An `AbortSignal` that is aborted when the element is disconnected
   *
   * Pass it as the `signal` of listeners and observers that are set up in `connectedCallback()`,
   * so they are removed when the element is disconnected. A new signal is created on every connect.
   */
  get disconnectSignal(): AbortSignal {
    return this.#disconnect.signal;
  }

  /**
   * Resolves when the pending update completes
   *
   * Resolves with `true` when no further update was requested during the update, and `false` otherwise
   */
  get updateComplete(): Promise<boolean> {
    return this.#updatePromise;
  }

  connectedCallback(): void {
    if (this.#disconnect.signal.aborted) {
      this.#disconnect = new AbortController();
    }
    if (this.#enableUpdating) {
      this.#upgradeProperties();
      // Record the initial value of every declared property, so it is reflected and part of the first update
      for (const name of finalize(
        this.constructor as GluonConstructor,
      ).properties.keys()) {
        this.requestUpdate(name, undefined);
      }
      this.#enableUpdating(true);
      this.#enableUpdating = undefined;
    }
  }

  disconnectedCallback(): void {
    this.#disconnect.abort();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    value: string | null,
  ): void {
    const info = finalize(this.constructor as GluonConstructor);
    const property = info.attributes.get(name);
    if (property === undefined || this.#reflectingProperty === property) {
      return;
    }
    const declaration = info.properties.get(property)!;
    const fromAttribute =
      declaration.converter?.fromAttribute ?? defaultConverter.fromAttribute;
    this.#reflectingProperty = property;
    (this as unknown as Properties)[property] = fromAttribute(
      value,
      declaration.type,
    );
    this.#reflectingProperty = undefined;
  }

  /**
   * Requests an update, which is performed in a microtask
   *
   * Called by the setter of every declared property. Call it without arguments to update after a change
   * that the element cannot see, such as a mutation of an array or object in a property.
   */
  requestUpdate(name?: string, oldValue?: unknown): void {
    if (name !== undefined) {
      const declaration =
        finalize(this.constructor as GluonConstructor).properties.get(name) ??
        {};
      const hasChanged = declaration.hasChanged ?? notEqual;
      if (!hasChanged((this as unknown as Properties)[name], oldValue)) {
        return;
      }
      if (!this.#changed.has(name)) {
        this.#changed.set(name, oldValue);
      }
      if (declaration.reflect && this.#reflectingProperty !== name) {
        this.#reflecting.add(name);
      }
    }
    if (!this.isUpdatePending) {
      this.isUpdatePending = true;
      this.#updatePromise = this.#enqueueUpdate(this.#updatePromise);
    }
  }

  /**
   * Performs the pending update now, instead of in a microtask
   *
   * Runs `shouldUpdate()`, `willUpdate()`, `update()`, `firstUpdated()`, and `updated()`
   */
  performUpdate(): void {
    if (!this.isUpdatePending) {
      return;
    }
    const changed = this.#changed as unknown as PropertyValues<this>;
    let shouldUpdate = false;
    try {
      shouldUpdate = this.shouldUpdate(changed);
      if (shouldUpdate) {
        this.willUpdate(changed);
        this.update(changed);
      }
    } finally {
      this.#changed = new Map();
      this.isUpdatePending = false;
    }
    if (shouldUpdate) {
      if (!this.hasUpdated) {
        this.hasUpdated = true;
        this.firstUpdated(changed);
      }
      this.updated(changed);
    }
  }

  /**
   * Decides whether an update is performed. Defaults to `true`
   */
  protected shouldUpdate(_changed: PropertyValues<this>): boolean {
    return true;
  }

  /**
   * Called before `update()`, to compute values that depend on the changed properties
   */
  protected willUpdate(_changed: PropertyValues<this>): void {}

  /**
   * Reflects the changed properties to their attributes, and renders the result of `render()` into the render root
   *
   * Nothing is rendered when `render()` returns `noChange`
   */
  protected update(_changed: PropertyValues<this>): void {
    for (const name of this.#reflecting) {
      this.#propertyToAttribute(name);
    }
    this.#reflecting.clear();
    const result = this.render();
    if (result !== noChange) {
      render(result, this.renderRoot, { host: this });
      if (this.#styleText !== undefined) {
        const style = document.createElement("style");
        style.textContent = this.#styleText;
        this.renderRoot.prepend(style);
        this.#styleText = undefined;
      }
    }
  }

  /**
   * Returns what to render into the render root, usually a lite-html template
   *
   * Return `noChange` to leave the render root as it is
   */
  protected render(): unknown {
    return noChange;
  }

  /**
   * Called after the first update
   */
  protected firstUpdated(_changed: PropertyValues<this>): void {}

  /**
   * Called after every update
   */
  protected updated(_changed: PropertyValues<this>): void {}

  async #enqueueUpdate(previous: Promise<boolean>): Promise<boolean> {
    await previous;
    try {
      this.performUpdate();
    } catch (error) {
      // Report the error without breaking the update cycle
      Promise.reject(error);
    }
    return !this.isUpdatePending;
  }

  /**
   * Applies properties that were set as own properties of the element, through their setters on the prototype
   *
   * This happens for properties that were set before the element was upgraded, and for class fields that are
   * defined on the instance and shadow their accessor
   */
  #upgradeProperties(): void {
    const prototype = Object.getPrototypeOf(this);
    const properties = this as unknown as Properties;
    for (const name of Object.getOwnPropertyNames(this)) {
      if (name in prototype) {
        const value = properties[name];
        delete properties[name];
        properties[name] = value;
      }
    }
  }

  #adoptStyles(): void {
    const root = this.renderRoot;
    const styles = getStyles(this.constructor as GluonConstructor);
    if (!(root instanceof ShadowRoot) || styles.length === 0) {
      return;
    }
    if ("adoptedStyleSheets" in root) {
      root.adoptedStyleSheets = styles.map(toStyleSheet);
    } else {
      this.#styleText = styles.map(toCSSText).join("\n");
    }
  }

  #propertyToAttribute(name: string): void {
    const declaration = finalize(
      this.constructor as GluonConstructor,
    ).properties.get(name)!;
    const attribute = attributeName(name, declaration);
    if (attribute === undefined) {
      return;
    }
    const toAttribute =
      declaration.converter?.toAttribute ?? defaultConverter.toAttribute;
    const value = toAttribute(
      (this as unknown as Properties)[name],
      declaration.type,
    );
    this.#reflectingProperty = name;
    if (value === null) {
      this.removeAttribute(attribute);
    } else {
      this.setAttribute(attribute, value);
    }
    this.#reflectingProperty = undefined;
  }
}
