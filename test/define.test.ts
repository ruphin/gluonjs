import { describe, it, expect, vi } from "vitest";
import { GluonElement, define } from "../src/index.js";

describe("define", () => {
  it("registers the class under the name, and returns the class", () => {
    class MyElement extends GluonElement {}
    expect(define(MyElement, "my-element")).toBe(MyElement);
    expect(customElements.get("my-element")).toBe(MyElement);
  });

  it("throws when the name is already defined", () => {
    class FirstElement extends GluonElement {}
    class SecondElement extends GluonElement {}
    define(FirstElement, "taken-element");
    expect(() => define(SecondElement, "taken-element")).toThrow();
  });

  it("registers with another registry", () => {
    class ScopedElement extends GluonElement {}
    const registry = {
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
