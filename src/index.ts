/**
 * @license
 * Copyright (c) 2026 Goffert van Gool
 * SPDX-License-Identifier: MIT
 */

// Pure public entrypoint: the element base class, helpers and types.
// Nothing in here has side effects, so bundlers can tree-shake unused exports.
export * from "lite-html";
export { GluonElement, define } from "./gluon.js";
export {
  type PropertyType,
  type AttributeConverter,
  type PropertyDeclaration,
  type PropertyDeclarations,
  type PropertyValues,
} from "./properties.js";
export { type StyleSheet, type Styles, css } from "./styles.js";
