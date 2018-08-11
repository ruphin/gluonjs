import { html, GluonElement } from '../src/gluon.js';

class HelloMessage extends GluonElement {
  get style() {
    return html`
      <style> p { color: firebrick } </style>
    `;
  }
  get template() {
    return html`
      ${this.style}
      <p>Hello ${this.getAttribute('name')}</p>
    `;
  }
}

class LoudMessage extends HelloMessage {
  get style() {
    return html`
      ${super.style}
      <style> p { text-transform: uppercase; font-weight: bold } </style>
    `;
  }
}

customElements.define(LoudMessage.is, LoudMessage);
customElements.define(HelloMessage.is, HelloMessage);
