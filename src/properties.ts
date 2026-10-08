/**
 * @license
 * Copyright (c) 2026 Goffert van Gool
 * SPDX-License-Identifier: MIT
 */

/**
 * The type of a declared property, used by the default converter to read and write attributes
 */
export type PropertyType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ArrayConstructor
  | ObjectConstructor;

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
  /** A converter between the property value and its attribute. Defaults to the built-in converter */
  converter?: AttributeConverter;
  /** Decides whether a new value counts as a change. Defaults to `!Object.is(value, oldValue)` */
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
        return value ? "" : null;
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
export const notEqual = (value: unknown, oldValue: unknown): boolean =>
  !Object.is(value, oldValue);

// Transforms a camelCased property name into a kebab-cased attribute name
export const camelToKebab = (camel: string): string =>
  camel
    .replace(/([a-z](?=[A-Z]))|([A-Z](?=[A-Z][a-z]))/g, "$1$2-")
    .toLowerCase();

export const attributeName = (
  name: string,
  { attribute }: PropertyDeclaration,
): string | undefined => (attribute ? camelToKebab(name) : undefined);
