import { describe, it, expect } from "vitest";
import {
  GluonElement,
  define,
  html,
  type PropertyDeclarations,
  type PropertyValues,
} from "../src/index.js";
import { mount, text, tag } from "./helpers.js";

describe("properties", () => {
  it("re-renders when a declared property changes", async () => {
    class Counter extends GluonElement {
      static override properties = { count: { type: Number } };
      count = 0;
      override render() {
        return html`${this.count}`;
      }
    }
    define(Counter, tag());
    const element = await mount(new Counter());
    expect(text(element)).toBe("0");
    element.count = 2;
    await element.updateComplete;
    expect(text(element)).toBe("2");
  });

  it("batches changes into one update", async () => {
    class Batched extends GluonElement {
      static override properties = { a: {}, b: {} };
      a = "";
      b = "";
      renders = 0;
      override render() {
        this.renders++;
        return html`${this.a}${this.b}`;
      }
    }
    define(Batched, tag());
    const element = await mount(new Batched());
    expect(element.renders).toBe(1);
    element.a = "x";
    element.b = "y";
    element.a = "z";
    expect(element.isUpdatePending).toBe(true);
    await element.updateComplete;
    expect(element.renders).toBe(2);
    expect(text(element)).toBe("zy");
  });

  it("does not update when the value does not change", async () => {
    class Same extends GluonElement {
      static override properties = { value: {} };
      value = "a";
    }
    define(Same, tag());
    const element = await mount(new Same());
    element.value = "a";
    expect(element.isUpdatePending).toBe(false);
  });

  it("converts attributes with the default converter", async () => {
    class Typed extends GluonElement {
      static override properties = {
        text: { attribute: true },
        count: { type: Number, attribute: true },
        active: { type: Boolean, attribute: true },
        list: { type: Array, attribute: true },
        data: { type: Object, attribute: true },
      };
      text = "";
      count = 0;
      active = false;
      list: unknown[] = [];
      data: unknown = {};
    }
    define(Typed, tag());
    const element = await mount(new Typed());
    element.setAttribute("text", "hello");
    element.setAttribute("count", "42");
    element.setAttribute("active", "");
    element.setAttribute("list", "[1,2]");
    element.setAttribute("data", '{"a":1}');
    expect(element.text).toBe("hello");
    expect(element.count).toBe(42);
    expect(element.active).toBe(true);
    expect(element.list).toEqual([1, 2]);
    expect(element.data).toEqual({ a: 1 });
    element.removeAttribute("count");
    element.removeAttribute("active");
    expect(element.count).toBeNull();
    expect(element.active).toBe(false);
  });

  it("reads attributes that are set before the element is connected", async () => {
    class Initial extends GluonElement {
      static override properties = { count: { type: Number, attribute: true } };
      count = 0;
      override render() {
        return html`${this.count}`;
      }
    }
    const name = tag();
    define(Initial, name);
    const container = document.createElement("div");
    container.innerHTML = `<${name} count="5"></${name}>`;
    const element = await mount(container.firstElementChild as Initial);
    expect(element.count).toBe(5);
    expect(text(element)).toBe("5");
  });

  it("observes the kebab-cased name of properties with `attribute: true`, and no others", async () => {
    class Named extends GluonElement {
      static override properties = {
        maxValue: { type: Number, attribute: true },
        internal: {},
      };
      maxValue = 0;
      internal = "";
    }
    define(Named, tag());
    expect(Named.observedAttributes).toEqual(["max-value"]);
    const element = await mount(new Named());
    element.setAttribute("max-value", "3");
    element.setAttribute("internal", "y");
    expect(element.maxValue).toBe(3);
    expect(element.internal).toBe("");
  });

  it("does nothing for `reflect` without `attribute`", async () => {
    class Unreflected extends GluonElement {
      static override properties = { count: { type: Number, reflect: true } };
      count = 0;
    }
    define(Unreflected, tag());
    const element = await mount(new Unreflected());
    element.count = 1;
    await element.updateComplete;
    expect(element.hasAttribute("count")).toBe(false);
  });

  it("reflects properties to attributes", async () => {
    class Reflected extends GluonElement {
      static override properties = {
        count: { type: Number, attribute: true, reflect: true },
        active: { type: Boolean, attribute: true, reflect: true },
        label: { attribute: true, reflect: true },
        isHidden: { type: Boolean, attribute: true, reflect: true },
      };
      count = 1;
      active = false;
      label: string | null = "a";
      isHidden = true;
    }
    define(Reflected, tag());
    const element = await mount(new Reflected());
    // Initial values are reflected by the first update
    expect(element.getAttribute("count")).toBe("1");
    expect(element.hasAttribute("active")).toBe(false);
    expect(element.getAttribute("label")).toBe("a");
    expect(element.getAttribute("is-hidden")).toBe("");
    element.count = 2;
    element.active = true;
    element.label = null;
    element.isHidden = false;
    expect(element.getAttribute("count")).toBe("1");
    await element.updateComplete;
    expect(element.getAttribute("count")).toBe("2");
    expect(element.getAttribute("active")).toBe("");
    expect(element.hasAttribute("label")).toBe(false);
    expect(element.hasAttribute("is-hidden")).toBe(false);
  });

  it("does not loop between a reflected attribute and its property", async () => {
    class Loop extends GluonElement {
      static override properties = {
        count: { type: Number, attribute: true, reflect: true },
      };
      count = 0;
      sets = 0;
      override updated(changed: PropertyValues<this>) {
        if (changed.has("count")) {
          this.sets++;
        }
      }
    }
    define(Loop, tag());
    const element = await mount(new Loop());
    element.sets = 0;
    element.setAttribute("count", "7");

    await element.updateComplete;
    expect(element.count).toBe(7);
    expect(element.getAttribute("count")).toBe("7");
    expect(element.sets).toBe(1);
    expect(element.isUpdatePending).toBe(false);
  });

  it("uses a custom `hasChanged`", async () => {
    class Custom extends GluonElement {
      static override properties = {
        length: {
          hasChanged: (value: unknown, old: unknown) =>
            String(value).length !== String(old).length,
        },
      };
      length = "aa";
    }
    define(Custom, tag());
    const element = await mount(new Custom());
    element.length = "bb";
    expect(element.isUpdatePending).toBe(false);
    element.length = "ccc";
    expect(element.isUpdatePending).toBe(true);
  });

  it("uses a custom converter", async () => {
    class Converted extends GluonElement {
      static override properties = {
        date: {
          attribute: true,
          reflect: true,
          converter: {
            fromAttribute: (value: string | null) =>
              value === null ? null : new Date(value),
            toAttribute: (value: unknown) =>
              value instanceof Date ? value.toISOString() : null,
          },
        },
      };
      date: Date | null = null;
    }
    define(Converted, tag());
    const element = await mount(new Converted());
    element.setAttribute("date", "2026-01-02T00:00:00.000Z");
    expect(element.date?.getTime()).toBe(Date.UTC(2026, 0, 2));
    element.date = new Date(Date.UTC(2026, 5, 1));
    await element.updateComplete;
    expect(element.getAttribute("date")).toBe("2026-06-01T00:00:00.000Z");
  });

  it("makes a class field reactive once the element is connected", async () => {
    class Field extends GluonElement {
      static override properties = { count: { type: Number } };
      // A class field is an own property that shadows the accessor until the element is connected
      count = 1;
      override render() {
        return html`${this.count}`;
      }
    }
    define(Field, tag());
    const element = new Field();
    expect(Object.hasOwn(element, "count")).toBe(true);
    await mount(element);
    expect(Object.hasOwn(element, "count")).toBe(false);
    expect(text(element)).toBe("1");
    element.count = 2;
    await element.updateComplete;
    expect(text(element)).toBe("2");
  });

  it("applies properties that were set before the element was upgraded", async () => {
    class Late extends GluonElement {
      static override properties = {
        count: { type: Number, attribute: true, reflect: true },
      };
      // A class field with an initializer would overwrite the value that was set before the upgrade
      #count = 0;
      get count() {
        return this.#count;
      }
      set count(count: number) {
        this.#count = count;
      }
      override render() {
        return html`${this.count}`;
      }
    }

    const name = tag();
    const element = document.createElement(name) as Late;
    element.count = 7;
    define(Late, name);
    await mount(element);
    expect(element.count).toBe(7);
    expect(text(element)).toBe("7");
    expect(element.getAttribute("count")).toBe("7");
  });

  it("creates an accessor for a declared property without one", async () => {
    class Generated extends GluonElement {
      static override properties = { value: {} };
      declare value: string;
      override render() {
        return html`${this.value ?? "none"}`;
      }
    }
    define(Generated, tag());
    const element = await mount(new Generated());
    expect(text(element)).toBe("none");
    element.value = "set";
    await element.updateComplete;
    expect(text(element)).toBe("set");
    expect(element.value).toBe("set");
  });

  it("wraps a getter and setter pair", async () => {
    class Pair extends GluonElement {
      static override properties = { value: { type: Number } };
      #value = 0;
      get value() {
        return this.#value;
      }
      set value(value: number) {
        this.#value = Math.max(0, value);
      }
      override render() {
        return html`${this.value}`;
      }
    }
    define(Pair, tag());
    const element = await mount(new Pair());
    element.value = -5;
    expect(element.value).toBe(0);
    expect(element.isUpdatePending).toBe(false);
    element.value = 5;
    await element.updateComplete;
    expect(text(element)).toBe("5");
  });

  it("inherits declared properties from a superclass", async () => {
    class Base extends GluonElement {
      // A class that is extended by a class with its own properties needs the annotation
      static override properties: PropertyDeclarations = {
        a: { attribute: true },
      };
      a = "a";
    }
    class Derived extends Base {
      static override properties = { b: { attribute: true } };

      b = "b";
      override render() {
        return html`${this.a}${this.b}`;
      }
    }
    define(Base, tag());
    define(Derived, tag());
    expect(Derived.observedAttributes).toEqual(["a", "b"]);
    const element = await mount(new Derived());
    expect(text(element)).toBe("ab");
    element.a = "x";
    element.b = "y";
    await element.updateComplete;
    expect(text(element)).toBe("xy");
  });

  it("passes the changed properties and their old values to the lifecycle methods", async () => {
    class Changes extends GluonElement {
      static override properties = { count: { type: Number }, label: {} };
      count = 0;
      label = "a";
      seen: Map<PropertyKey, unknown>[] = [];

      override updated(changed: PropertyValues<this>) {
        this.seen.push(new Map(changed));
      }
    }
    define(Changes, tag());
    const element = await mount(new Changes());
    expect(element.seen[0]).toEqual(
      new Map([
        ["count", undefined],
        ["label", undefined],
      ]),
    );
    element.count = 1;
    element.count = 2;
    await element.updateComplete;
    expect(element.seen[1]).toEqual(new Map([["count", 0]]));
  });
});
