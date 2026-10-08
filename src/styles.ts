/**
 * @license
 * Copyright (c) 2026 Goffert van Gool
 * SPDX-License-Identifier: MIT
 */

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
export const css = (
  strings: TemplateStringsArray,
  ...values: unknown[]
): string =>
  strings.reduce(
    (result, string, index) => result + String(values[index - 1]) + string,
  );

// Constructed stylesheets for each CSS string, shared by every element that uses that string
const styleSheets = new Map<string, CSSStyleSheet>();

/**
 * Returns a constructed stylesheet for a style, sharing one sheet per CSS string
 */
export const toStyleSheet = (style: StyleSheet): CSSStyleSheet => {
  if (typeof style !== "string") {
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

/**
 * Returns the CSS text of a style, for a `<style>` element
 */
export const toCSSText = (style: StyleSheet): string =>
  typeof style === "string"
    ? style
    : Array.from(style.cssRules, (rule) => rule.cssText).join("\n");
