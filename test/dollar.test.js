import { describe, it, beforeEach, expect } from 'vitest';
import { GluonElement, html } from '../src/gluon.js';

class TestDollarElement extends GluonElement {
  get template() {
    return html`<div id="one">test</div><div id="two"></div><div class="irrelevant"></div>`;
  }
}

customElements.define(TestDollarElement.is, TestDollarElement);

const container = document.createElement('div');
container.style.display = 'none';
document.body.appendChild(container);

let testElement;
const setup = () => {
  container.innerHTML = '';
  container.innerHTML = `<${TestDollarElement.is}></${TestDollarElement.is}>`;
  testElement = container.querySelector(TestDollarElement.is);
};

describe(`'$' property`, () => {
  beforeEach(() => setup());

  it('should contain a key for each child with an ID', () => {
    expect(Object.keys(testElement.$).length).toBe(2);
  });

  it('should map to the elements by ID', () => {
    expect(testElement.$.one).toBe(testElement.shadowRoot.getElementById('one'));
    expect(testElement.$.two).toBe(testElement.shadowRoot.getElementById('two'));
  });
});
