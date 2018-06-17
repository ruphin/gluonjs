import { html, GluonElement } from '../gluon.js';

class HelloMessage extends GluonElement {
  get style() {
    return html`
      <style> p { color: firebrick; font-weight: bold } </style>
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
      <style> p { text-transform: uppercase } </style>
    `;
  }
}

customElements.define(LoudMessage.is, LoudMessage);
customElements.define(HelloMessage.is, HelloMessage);
