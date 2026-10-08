import { describe, it, expect, vi } from "vitest";
import { GluonElement, define } from "../src/index.js";

describe("define", () => {
  it("registers the class under the name, and returns the class", () => {
    class MyElement extends GluonElement {}
    expect(define(MyElement, "my-element")).toBe(MyElement);
    expect(customElements.get("my-element")).toBe(MyElement);
  });

  it("does not throw when the class is defined again", () => {
    class TwiceElement extends GluonElement {}
    define(TwiceElement, "twice-element");
    expect(() => define(TwiceElement, "twice-element")).not.toThrow();
  });

  it("keeps the existing definition and warns when the name is taken by another class", () => {
    class FirstElement extends GluonElement {}
    class SecondElement extends GluonElement {}
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    define(FirstElement, "taken-element");
    define(SecondElement, "taken-element");
    expect(customElements.get("taken-element")).toBe(FirstElement);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("registers with another registry", () => {
    class ScopedElement extends GluonElement {}
    const registry = {
      get: vi.fn(),
      define: vi.fn(),
    } as unknown as CustomElementRegistry;
    define(ScopedElement, "scoped-element", registry);

    expect(registry.define).toHaveBeenCalledWith(
      "scoped-element",
      ScopedElement,
    );
    expect(customElements.get("scoped-element")).toBeUndefined();
  });
});
