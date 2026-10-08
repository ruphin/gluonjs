# GluonJS

[![NPM Latest version](https://img.shields.io/npm/v/@gluon/gluon.svg)](https://www.npmjs.com/package/@gluon/gluon)

_A tiny base class for Web Components_

---

- **Reactive properties:** Declare the properties of an element once. Each one re-renders the element when it changes, and can be set from an attribute with type conversion and optional reflection.
- **Batched rendering:** Templates are written with [lite-html](https://github.com/ruphin/lite-html) and rendered into a shadow root. Changes are batched into one render per microtask, and only the changed parts of the template are updated.
- **Single file components:** Styles, properties, logic, and template live in one class, in one file. No decorators, no compiler settings, and no build step for plain JavaScript.
- **Standards based:** Elements are plain custom elements, with the Web Component APIs available directly. They work in any framework, see [Custom Elements Everywhere](https://custom-elements-everywhere.com/).

## Example

```typescript
import { GluonElement, define, html, css } from '@gluon/gluon';

class MyCounter extends GluonElement {
  static override styles = css`
    :host { display: inline-flex; gap: 8px; }
    button { font: inherit; }
  `;

  static override properties = {
    count: { type: Number, attribute: true, reflect: true },
    step: { type: Number, attribute: true },
  };

  count = 0;
  step = 1;

  override render() {
    return html`
      <button @click=${this.decrement}>-</button>
      <span>${this.count}</span>
      <button @click=${this.increment}>+</button>
    `;
  }

  increment() {
    this.count += this.step;
    this.emit();
  }

  decrement() {
    this.count -= this.step;
    this.emit();
  }

  private emit() {
    this.dispatchEvent(new CustomEvent('count-changed', { detail: { count: this.count }, bubbles: true, composed: true }));
  }
}

define(MyCounter, 'my-counter');

declare global {
  interface HTMLElementTagNameMap {
    'my-counter': MyCounter;
  }
  interface GlobalEventHandlersEventMap {
    'count-changed': CustomEvent<{ count: number }>;
  }
}
```

```html
<script type="module" src="/my-counter.js"></script>

<my-counter count="5" step="5"></my-counter>
```

## Installing

```
npm install @gluon/gluon
```

GluonJS is published as an ES module with type declarations, and depends on `lite-html`. Import it from your bundler or import map:

```javascript
import { GluonElement, define, html, css } from '@gluon/gluon';
```

Or load the bundle that includes lite-html:

```javascript
import { GluonElement, define, html } from 'https://unpkg.com/@gluon/gluon';
```

The `html`, `svg`, and `render` functions and the directives of lite-html are exported from `@gluon/gluon` as well, so one import is enough.

## Elements

An element is a class that extends `GluonElement`, registered with `define`:

```typescript
class MyElement extends GluonElement {
  override render() {
    return html`<p>Hello</p>`;
  }
}

define(MyElement, 'my-element');
```

### define(ElementClass, name, registry?)

Registers the class with a custom element registry under the tag name `name`, and returns the class.

A name that is already registered is not registered again, so a module can be loaded more than once, for example by a development server that reloads modules. When the name is registered with a different class, the existing registration is kept and a warning is logged.

The `registry` defaults to the global `customElements`. Pass a scoped `CustomElementRegistry` to register the element in that scope.

### render()

Returns what the element renders: a lite-html template, or any other [renderable value](https://github.com/ruphin/lite-html#renderable-values). The result is rendered into `renderRoot`, which is an open shadow root by default. Only the parts of the template that changed since the last render are updated.

Event handlers in the template are called with the element as `this`, so methods of the element can be used directly: `@click=${this.increment}`.

`render()` runs in a microtask after the element is connected, and again after any of its properties change. It should be a pure function of the element's properties and state. Return `noChange` to leave the rendered content as it is.

### createRenderRoot()

Returns the node to render into. By default it attaches a shadow root with the static `shadowRootOptions`, or reuses the shadow root that already exists. Override it to render somewhere else:

```typescript
class LightElement extends GluonElement {
  protected override createRenderRoot() {
    return this; // Render as the children of the element
  }
}
```

The static `shadowRootOptions` default to `{ mode: 'open' }`. Override them to make the shadow root closed, or to delegate focus:

```typescript
static override shadowRootOptions: ShadowRootInit = { mode: 'open', delegatesFocus: true };
```

### styles

The static `styles` are applied to the shadow root of every instance: a string of CSS, a constructed `CSSStyleSheet`, or an array of either. Each string is turned into one `CSSStyleSheet` that is shared by all instances. Where constructed stylesheets cannot be adopted, a `<style>` element is added to the shadow root instead.

The `css` tag returns its template literal as a string. It marks the CSS for editors, formatters, and linters, and composes interpolated styles and numbers: `` css`${base} p { gap: ${8}px; }` ``.

```typescript
class StyledElement extends GluonElement {
  static override styles = css`
    :host { display: block; }
    p { color: firebrick; }
  `;
}
```

Styles are not applied when the element renders into its light DOM. A class that is extended by another class with its own styles needs the `Styles` type annotation on the field, so TypeScript accepts a different value in the subclass:

```typescript
class BaseElement extends GluonElement {
  static override styles: Styles = css`p { color: firebrick; }`;
}

class LoudElement extends BaseElement {
  static override styles = [BaseElement.styles!, css`p { font-weight: bold; }`].flat();

}
```

## Properties

Reactive properties are declared in the static `properties` map, and defined as class fields with their default values:

```typescript
class MyElement extends GluonElement {
  static override properties = {
    name: { attribute: true },
    count: { type: Number, attribute: true, reflect: true },
    active: { type: Boolean, attribute: true },
    items: { type: Array },
  };

  name = '';
  count = 0;
  active = false;
  items: string[] = [];
}
```

Every declared property becomes an accessor that requests an update when its value changes. The class field is the default value. A property has no attribute unless it is declared with `attribute: true`, which observes the kebab-cased name of the property: `maxValue` is set from `max-value`. The options of a property are:

| Option       | Default            | Meaning                                                                                                       |
| ------------ | ------------------ | ------------------------------------------------------------------------------------------------------------- |
| `type`       | `String`           | `String`, `Number`, `Boolean`, `Array`, or `Object`. A hint for the default converter                        |
| `attribute`  | `false`            | Set the property from the attribute with its kebab-cased name                                                 |
| `reflect`    | `false`            | Write the property to its attribute when it changes, including its initial value. Only with `attribute: true` |
| `converter`  | `defaultConverter` | An object with `fromAttribute(value, type)` and `toAttribute(value, type)` functions                            |
| `hasChanged` | `notEqual`         | A function `(value, oldValue) => boolean` that decides whether a new value counts as a change                  |

The default converter copies `String` attributes, parses `Number` attributes with `Number()`, treats `Boolean` attributes as `true` when present, and parses `Array` and `Object` attributes as JSON. A property that is `null` or `undefined` removes its attribute when reflected. Rich data belongs in properties, not attributes: pass it from a template with `.items=${items}`, and leave `attribute` off.


Changing a property requests an update. Mutating an array or object inside a property does not, because the property itself did not change. Either assign a new value, or call `requestUpdate()`:

```typescript
addItem(item: string) {
  this.items = [...this.items, item]; // Requests an update
}

addItemInPlace(item: string) {
  this.items.push(item);
  this.requestUpdate(); // The element cannot see the push
}
```

### Class fields and accessors

A class field is defined on the instance when the element is constructed, and shadows the accessor on the prototype until the element is connected. At the first connect, the field is removed and its value is applied through the accessor. Properties and attributes that are set before that moment are kept, with one exception: a property that is set on an element before its class is defined is overwritten by the class field when the element is upgraded.

To keep such values, declare the property with a getter and setter pair instead of a field. With TypeScript 5 or a bundler that lowers the keyword, the `accessor` keyword does the same in one line:

```typescript
accessor count = 0;
```

Vite lowers `accessor` only with `experimentalDecorators: true` in `tsconfig.json`. Without that setting, the keyword reaches the browser unchanged, and no browser supports it yet.

### A property with custom behaviour

A declared property can have its own getter and setter. The setter is wrapped so it still requests an update:

```typescript
static override properties = { value: { type: Number } };

#value = 0;

get value() {
  return this.#value;
}

set value(value: number) {
  this.#value = Math.max(0, value);
}
```

### Inheritance

A class inherits the properties of its superclass, and can declare more. A class that is extended by another class with its own properties needs the `PropertyDeclarations` type annotation on the map, so TypeScript accepts a different map in the subclass:

```typescript
class BaseElement extends GluonElement {
  static override properties: PropertyDeclarations = { name: { attribute: true } };
  name = '';
}


class ExtendedElement extends BaseElement {
  static override properties = { count: { type: Number } };
  count = 0;
}
```

## Updates

Changing a property schedules an update in a microtask. All changes before the microtask are batched into one update. An update runs these methods in order, each with a `PropertyValues` map of the changed properties to their previous values:

1. `shouldUpdate(changed)`: return `false` to skip the update. Defaults to `true`.
2. `willUpdate(changed)`: compute values that depend on the changed properties, before rendering.
3. `update(changed)`: reflects properties to attributes, and renders `render()` into `renderRoot`. Call `super.update(changed)` when overriding it.
4. `firstUpdated(changed)`: called once, after the first update. The rendered DOM exists from here on.
5. `updated(changed)`: called after every update.

```typescript
class FullName extends GluonElement {
  static override properties = { first: {}, last: {} };
  first = '';
  last = '';
  full = '';

  override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('first') || changed.has('last')) {
      this.full = `${this.first} ${this.last}`;
    }
  }

  override render() {
    return html`<p>${this.full}</p>`;
  }
}
```

The first update waits for the element to be connected. Elements render after they are connected, whether or not they are still connected.

### updateComplete

A promise that resolves when the pending update completes. It resolves with `true` when no further update was requested during the update, and `false` otherwise. Await it before reading the rendered DOM:

```typescript
element.count = 5;
await element.updateComplete;
element.renderRoot.querySelector('span'); // Shows 5
```

### requestUpdate(name?, oldValue?)

Requests an update. Call it without arguments after a change the element cannot see, such as a mutation of an array in a property. The setters of declared properties call it with the property name and its previous value.

### performUpdate()

Performs the pending update now, instead of in a microtask.

### isUpdatePending and hasUpdated

`isUpdatePending` is `true` while an update is scheduled. `hasUpdated` is `true` after the first update.

## Lifecycle

The standard custom element callbacks are available. Call the `super` method when overriding `connectedCallback()`, `disconnectedCallback()`, or `attributeChangedCallback()`.

`connectedCallback()` runs every time the element is connected, including when it is moved. Listeners on the document or window belong here, with the `disconnectSignal` as their `signal`, so they are removed when the element is disconnected:

```typescript
override connectedCallback() {
  super.connectedCallback();
  window.addEventListener('resize', this.measure, { signal: this.disconnectSignal });
}
```

`disconnectSignal` is an `AbortSignal` that is aborted when the element is disconnected. A new signal is created on every connect.

## Events

Dispatch events with `dispatchEvent`. An event that should be heard outside the shadow root needs `composed: true`, and `bubbles: true` to reach ancestors:

```typescript
this.dispatchEvent(new CustomEvent('count-changed', { detail: { count: this.count }, bubbles: true, composed: true }));
```

Declare the event in `GlobalEventHandlersEventMap`, so `addEventListener('count-changed', ...)` is typed on elements, documents, and windows:

```typescript
declare global {
  interface GlobalEventHandlersEventMap {
    'count-changed': CustomEvent<{ count: number }>;
  }
}
```

## TypeScript

GluonJS ships type declarations and needs no compiler settings. Declare every element in `HTMLElementTagNameMap`, so `document.createElement('my-counter')` and `querySelector('my-counter')` return the element class:

```typescript
declare global {
  interface HTMLElementTagNameMap {
    'my-counter': MyCounter;
  }
}
```

With `noImplicitOverride`, the overridden members of the base class carry the `override` keyword, as in the examples above. Without it, the keyword can be left out.

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright © 2026-present, Goffert van Gool
