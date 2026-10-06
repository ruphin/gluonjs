import { describe, it, expect } from 'vitest';
import { GluonElement } from '../src/gluon.js';

describe(`'is' property`, () => {
  it(`should be 'regular-element' for RegularElement`, () => {
    expect(class RegularElement extends GluonElement {}.is).toBe('regular-element');
  });

  it(`should be 'caps-first-element' for CAPSFirstElement`, () => {
    expect(class CAPSFirstElement extends GluonElement {}.is).toBe('caps-first-element');
  });

  it(`should be 'caps-middle-element' for CapsMIDDLEElement`, () => {
    expect(class CapsMIDDLEElement extends GluonElement {}.is).toBe('caps-middle-element');
  });

  it(`should be 'caps-last-element' for CapsLastELEMENT`, () => {
    expect(class CapsLastELEMENT extends GluonElement {}.is).toBe('caps-last-element');
  });

  it(`should be 'as-sh-ol-ec-as-e-element' for AsShOlEcAsEElement`, () => {
    expect(class AsShOlEcAsEElement extends GluonElement {}.is).toBe('as-sh-ol-ec-as-e-element');
  });
});
