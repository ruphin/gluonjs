import { GluonElement, html } from '/gluon.js';

class HelloMessage extends GluonElement {
  get template() {
    return html`<div>Hello ${this.getAttribute('name')}</div>`;
  }
}

customElements.define(HelloMessage.is, HelloMessage);
