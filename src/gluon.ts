/**
 * @license
 * Copyright (c) 2026 Goffert van Gool
 * SPDX-License-Identifier: MIT
 */

import { render, noChange } from 'lite-html';

export * from 'lite-html';

/**
 * The type of a declared property, used by the default converter to read and write attributes
 */
export type PropertyType = StringConstructor | NumberConstructor | BooleanConstructor | ArrayConstructor | ObjectConstructor;

/**
 * Converts between a property value and its attribute value
 *
 * `fromAttribute` is called with `null` when the attribute is removed
 * `toAttribute` returns `null` to remove the attribute
 */
export interface AttributeConverter {
  fromAttribute?: (value: string | null, type?: PropertyType) => unknown;
  toAttribute?: (value: unknown, type?: PropertyType) => string | null;
}

/**
 * The declaration of a reactive property in the static `properties` map of an element class
 */
export interface PropertyDeclaration {
  /** The type of the property, as a hint for the default converter. Defaults to `String` */
  type?: PropertyType;
  /** Whether the property is set from the attribute with its kebab-cased name. Defaults to `false` */
  attribute?: boolean;
  /** Whether the property value is written to its attribute when it changes, with `attribute`. Defaults to `false` */

  reflect?: boolean;
  /** A converter between the property value and its attribute. Defaults to `defaultConverter` */
  converter?: AttributeConverter;
  /** Decides whether a new value counts as a change. Defaults to `notEqual` */
  hasChanged?: (value: unknown, oldValue: unknown) => boolean;
}

export type PropertyDeclarations = Record<string, PropertyDeclaration>;

/**
 * A map of the changed properties to their previous values, passed to the update lifecycle methods
 *
 * The keys are typed as the properties of the element, so `changed.has('count')` is checked
 */
export interface PropertyValues<T = unknown> extends Map<PropertyKey, unknown> {
  get<K extends keyof T>(key: K): T[K] | undefined;
  has<K extends keyof T>(key: K): boolean;
  set<K extends keyof T>(key: K, value: T[K]): this;
  delete<K extends keyof T>(key: K): boolean;
}


/**
 * A stylesheet for an element: CSS text, or a constructed `CSSStyleSheet`
 */
export type StyleSheet = string | CSSStyleSheet;
export type Styles = StyleSheet | readonly StyleSheet[];

/**
 * Tagging function for CSS in template string literals
 *
 * Returns the CSS as a string, for the static `styles` of an element. The tag marks the string as CSS
 * for editors, formatters, and linters. Interpolated values are converted to strings, so other styles
 * and numbers can be composed into it.
 */
export const css = (strings: TemplateStringsArray, ...values: unknown[]): string =>
  strings.reduce((result, string, index) => result + String(values[index - 1]) + string);

/**
 * The converter that is used for properties without their own

 *
 * `String` properties are copied, `Number` properties are parsed with `Number()`,
 * `Boolean` properties are `true` when the attribute is present, and `Array` and `Object` properties are JSON
 * A property that is `null` or `undefined` removes its attribute
 */
export const defaultConverter: Required<AttributeConverter> = {
  fromAttribute(value, type) {
    switch (type) {
      case Boolean:
        return value !== null;
      case Number:
        return value === null ? null : Number(value);
      case Array:
      case Object:
        return value === null ? null : JSON.parse(value);
      default:
        return value;
    }
  },
  toAttribute(value, type) {
    switch (type) {
      case Boolean:
        return value ? '' : null;
      case Array:
      case Object:
        return value == null ? null : JSON.stringify(value);
      default:
        return value == null ? null : String(value);
    }
  },
};

/**
 * The change detection that is used for properties without their own
 */
export const notEqual = (value: unknown, oldValue: unknown): boolean => !Object.is(value, oldValue);

// Transforms a camelCased property name into a kebab-cased attribute name
const camelToKebab = (camel: string): string =>
  camel.replace(/([a-z](?=[A-Z]))|([A-Z](?=[A-Z][a-z]))/g, '$1$2-').toLowerCase();

const attributeName = (name: string, { attribute }: PropertyDeclaration): string | undefined =>
  attribute ? camelToKebab(name) : undefined;

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
// Constructed stylesheets for each CSS string, shared by every element that uses that string
const styleSheets = new Map<string, CSSStyleSheet>();

/**
 * Makes a declared property reactive
 *
 * The property is an accessor on the prototype, declared with the `accessor` keyword or a getter and setter pair,
 * or on the prototype of a superclass. When there is none, an accessor with its own storage is created.
 * The setter is wrapped so it requests an update when the value changes.
 */
const defineAccessor = (prototype: object, name: string): void => {
  let descriptor: PropertyDescriptor | undefined;
  for (let object = prototype; object !== GluonElement.prototype && !descriptor; object = Object.getPrototypeOf(object)) {
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
  Object.defineProperty(prototype, name, { get, set: reactiveSet, configurable: true, enumerable: true });
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
  const inherited = ctor === GluonElement ? undefined : finalize(Object.getPrototypeOf(ctor));
  info = { properties: new Map(inherited?.properties), attributes: new Map(inherited?.attributes) };
  classInfos.set(ctor, info);
  if (Object.hasOwn(ctor, 'properties')) {
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

const toStyleSheet = (style: StyleSheet): CSSStyleSheet => {
  if (typeof style !== 'string') {
    return style;
  }
  let sheet = styleSheets.get(style);
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(style);
    styleSheets.set(style, sheet);
  }
  return sheet;
};

const toCSSText = (style: StyleSheet): string =>
  typeof style === 'string' ? style : Array.from(style.cssRules, rule => rule.cssText).join('\n');

/**
 * Registers an element class with a custom element registry, under the tag name `name`
 *
 * A name that is already registered is not registered again, so a module can be loaded more than once.
 * When the name is registered with a different class, the existing registration is kept and a warning is logged.
 */
export const define = <T extends GluonConstructor>(ctor: T, name: string, registry: CustomElementRegistry = customElements): T => {
  const existing = registry.get(name);
  if (!existing) {
    registry.define(name, ctor);
  } else if (existing !== ctor) {
    console.warn(`<${name}> is already defined with a different class, the existing definition is kept`);
  }
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
  static shadowRootOptions: ShadowRootInit = { mode: 'open' };

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
  // Resolves the promise that the first update waits for, called on the first connect
  #enableUpdating!: (value: boolean) => void;
  // Whether the element has been connected before
  #connected = false;
  // The styles that are added as a `<style>` element after the first render, when stylesheets cannot be adopted
  #styleText: string | undefined;
  // Aborted when the element is disconnected
  #disconnect = new AbortController();

  constructor() {
    super();
    finalize(this.constructor as GluonConstructor);
    this.#updatePromise = new Promise(resolve => (this.#enableUpdating = resolve));
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
    return this.shadowRoot ?? this.attachShadow((this.constructor as GluonConstructor).shadowRootOptions);
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
    if (!this.#connected) {
      this.#connected = true;
      this.#upgradeProperties();
      // Record the initial value of every declared property, so it is reflected and part of the first update
      for (const name of finalize(this.constructor as GluonConstructor).properties.keys()) {
        this.requestUpdate(name, undefined);
      }
      this.#enableUpdating(true);
    }
  }

  disconnectedCallback(): void {
    this.#disconnect.abort();
  }

  attributeChangedCallback(name: string, _oldValue: string | null, value: string | null): void {
    const info = finalize(this.constructor as GluonConstructor);
    const property = info.attributes.get(name);
    if (property === undefined || this.#reflectingProperty === property) {
      return;
    }
    const declaration = info.properties.get(property)!;
    const fromAttribute = declaration.converter?.fromAttribute ?? defaultConverter.fromAttribute;
    this.#reflectingProperty = property;
    (this as unknown as Properties)[property] = fromAttribute(value, declaration.type);
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
      const declaration = finalize(this.constructor as GluonConstructor).properties.get(name) ?? {};
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
        const style = document.createElement('style');
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
    if ('adoptedStyleSheets' in root) {
      root.adoptedStyleSheets = styles.map(toStyleSheet);
    } else {
      this.#styleText = styles.map(toCSSText).join('\n');
    }
  }

  #propertyToAttribute(name: string): void {
    const declaration = finalize(this.constructor as GluonConstructor).properties.get(name)!;
    const attribute = attributeName(name, declaration);
    if (attribute === undefined) {
      return;
    }
    const toAttribute = declaration.converter?.toAttribute ?? defaultConverter.toAttribute;
    const value = toAttribute((this as unknown as Properties)[name], declaration.type);
    this.#reflectingProperty = name;
    if (value === null) {
      this.removeAttribute(attribute);
    } else {
      this.setAttribute(attribute, value);
    }
    this.#reflectingProperty = undefined;
  }
}
