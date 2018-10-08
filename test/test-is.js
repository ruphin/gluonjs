import { GluonElement } from '../src/gluon.js';

const expect = chai.expect;

describe(`'is' property`, () => {
  it(`should be 'regular-element' for RegularElement`, () => {
    expect(class RegularElement extends GluonElement {}.is).to.be.equal('regular-element');
  });

  it(`should be 'caps-first-element' for CAPSFirstElement`, () => {
    expect(class CAPSFirstElement extends GluonElement {}.is).to.be.equal('caps-first-element');
  });

  it(`should be 'caps-middle-element' for CapsMIDDLEElement`, () => {
    expect(class CapsMIDDLEElement extends GluonElement {}.is).to.be.equal('caps-middle-element');
  });

  it(`should be 'caps-last-element' for CapsLastELEMENT`, () => {
    expect(class CapsLastELEMENT extends GluonElement {}.is).to.be.equal('caps-last-element');
  });

  it(`should be 'as-sh-ol-ec-as-e-element' for AsShOlEcAsEElement`, () => {
    expect(class AsShOlEcAsEElement extends GluonElement {}.is).to.be.equal('as-sh-ol-ec-as-e-element');
  });
});
