import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { GluonElement, define, html, css, type Styles } from "../src/index.js";
import { mount, text, innerHTML, tag } from "./helpers.js";

describe("rendering", () => {
  it("renders into an open shadow root", async () => {
    class Shadowed extends GluonElement {
      override render() {
        return html`<p>shadow</p>`;
      }
    }
    define(Shadowed, tag());
    const element = await mount(new Shadowed());
    expect(element.shadowRoot).toBeInstanceOf(ShadowRoot);
    expect(element.renderRoot).toBe(element.shadowRoot);
    expect(innerHTML(element.shadowRoot!)).toBe("<p>shadow</p>");
    expect(element.childNodes.length).toBe(0);
  });

  it("uses the static `shadowRootOptions`", async () => {
    class Closed extends GluonElement {
      static override shadowRootOptions: ShadowRootInit = { mode: "closed" };
      override render() {
        return html`closed`;
      }
    }
    define(Closed, tag());
    const element = await mount(new Closed());
    expect(element.shadowRoot).toBeNull();
    expect(element.renderRoot).toBeInstanceOf(ShadowRoot);
    expect(text(element)).toBe("closed");
  });

  it("renders into the light DOM when `createRenderRoot` returns the element", async () => {
    class Light extends GluonElement {
      protected override createRenderRoot() {
        return this;
      }
      override render() {
        return html`<p>light</p>`;
      }
    }
    define(Light, tag());
    const element = await mount(new Light());
    expect(element.shadowRoot).toBeNull();
    expect(innerHTML(element)).toBe("<p>light</p>");
  });

  it("leaves the render root alone when `render` returns `noChange`", async () => {
    class Container extends GluonElement {
      protected override createRenderRoot() {
        return this;
      }
    }
    define(Container, tag());
    const element = new Container();
    element.innerHTML = "<p>child</p>";
    await mount(element);
    expect(innerHTML(element)).toBe("<p>child</p>");
    element.requestUpdate();
    await element.updateComplete;
    expect(innerHTML(element)).toBe("<p>child</p>");
  });

  it("calls event handlers with the element as `this`", async () => {
    class Clickable extends GluonElement {
      static override properties = { count: { type: Number } };
      count = 0;
      override render() {
        return html`<button @click=${this.increment}>${this.count}</button>`;
      }
      increment() {
        this.count++;
      }
    }
    define(Clickable, tag());
    const element = await mount(new Clickable());
    element.renderRoot.querySelector("button")!.click();
    await element.updateComplete;
    expect(element.count).toBe(1);
    expect(text(element)).toBe("1");
  });

  it("updates only the changed parts of the template", async () => {
    class Partial extends GluonElement {
      static override properties = { value: {} };
      value = "a";
      override render() {
        return html`<p>${this.value}</p>`;
      }
    }
    define(Partial, tag());
    const element = await mount(new Partial());
    const paragraph = element.renderRoot.querySelector("p");
    element.value = "b";
    await element.updateComplete;
    expect(element.renderRoot.querySelector("p")).toBe(paragraph);
    expect(text(element)).toBe("b");
  });
});

describe("css", () => {
  it("returns the CSS as a string", () => {
    expect(css`p { color: red; }`).toBe("p { color: red; }");
  });

  it("composes interpolated styles and numbers", () => {
    const base = css`p { color: red; }`;
    expect(css`${base} i { gap: ${8}px; }`).toBe(
      "p { color: red; } i { gap: 8px; }",
    );
  });
});

describe("styles", () => {
  const css = "p { color: red; }";

  it("adds a `<style>` element when stylesheets cannot be adopted", async () => {
    class Styled extends GluonElement {
      static override styles = css;
      static override properties = { value: {} };
      value = "a";
      override render() {
        return html`<p>${this.value}</p>`;
      }
    }
    define(Styled, tag());
    const element = await mount(new Styled());
    const style = element.renderRoot.querySelector("style");
    expect(style?.textContent).toBe(css);
    expect(innerHTML(element.renderRoot)).toBe(`<style>${css}</style><p>a</p>`);
    element.value = "b";
    await element.updateComplete;
    expect(element.renderRoot.querySelector("style")).toBe(style);
    expect(innerHTML(element.renderRoot)).toBe(`<style>${css}</style><p>b</p>`);
  });

  it("accepts a list of CSS strings and constructed stylesheets", async () => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync("b { color: blue; }");
    class Listed extends GluonElement {
      static override styles = [css, sheet];
      override render() {
        return html`<p></p>`;
      }
    }
    define(Listed, tag());
    const element = await mount(new Listed());
    expect(element.renderRoot.querySelector("style")?.textContent).toBe(
      `${css}\n${sheet.cssRules[0]!.cssText}`,
    );
  });

  it("inherits the styles of a superclass, and can extend them", async () => {
    class Base extends GluonElement {
      // A class that is extended by a class with its own styles needs the annotation
      static override styles: Styles = css;
      override render() {
        return html`<p></p>`;
      }
    }
    class Inherits extends Base {}

    class Extends extends Base {
      static override styles = [Base.styles!, "i { color: green; }"].flat();
    }
    define(Base, tag());
    define(Inherits, tag());
    define(Extends, tag());
    expect(
      (await mount(new Inherits())).renderRoot.querySelector("style")
        ?.textContent,
    ).toBe(css);
    expect(
      (await mount(new Extends())).renderRoot.querySelector("style")
        ?.textContent,
    ).toBe(`${css}\ni { color: green; }`);
  });

  it("does not apply styles to the light DOM", async () => {
    class Light extends GluonElement {
      static override styles = css;
      protected override createRenderRoot() {
        return this;
      }
      override render() {
        return html`<p></p>`;
      }
    }
    define(Light, tag());
    const element = await mount(new Light());
    expect(element.querySelector("style")).toBeNull();
  });

  describe("with adopted stylesheets", () => {
    // jsdom does not implement `adoptedStyleSheets`, so simulate the property on the shadow root prototype
    beforeEach(() => {
      const adopted = new WeakMap<ShadowRoot, CSSStyleSheet[]>();
      Object.defineProperty(ShadowRoot.prototype, "adoptedStyleSheets", {
        configurable: true,
        get(this: ShadowRoot) {
          return adopted.get(this) ?? [];
        },
        set(this: ShadowRoot, sheets: CSSStyleSheet[]) {
          adopted.set(this, sheets);
        },
      });
    });
    afterEach(() => {
      delete (ShadowRoot.prototype as Partial<ShadowRoot>).adoptedStyleSheets;
    });

    it("adopts one constructed stylesheet per CSS string, shared between instances", async () => {
      const sheet = new CSSStyleSheet();
      class Adopted extends GluonElement {
        static override styles = [css, sheet];
        override render() {
          return html`<p></p>`;
        }
      }
      define(Adopted, tag());
      const one = await mount(new Adopted());
      const two = await mount(new Adopted());
      const sheets = (one.renderRoot as ShadowRoot).adoptedStyleSheets;
      expect(sheets).toHaveLength(2);
      expect(sheets[0]).toBeInstanceOf(CSSStyleSheet);
      expect(sheets[0]!.cssRules[0]!.cssText).toContain("color: red");

      expect(sheets[1]).toBe(sheet);
      expect((two.renderRoot as ShadowRoot).adoptedStyleSheets[0]).toBe(
        sheets[0],
      );
      expect(one.renderRoot.querySelector("style")).toBeNull();
    });
  });
});
