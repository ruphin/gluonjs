import { html, GluonElement } from '../gluon.js';

class HelloMessage extends GluonElement {
  get style() {
    return html`<style> p { color: firebrick } </style>`;
  }
  get template() {
    return html`
      ${this.style}
      <p>Hello ${this.getAttribute('name')}</p>
    `;
  }
  set name(value) {
    this.setAttribute('name', value);
    this.render();
  }
}

class LoudMessage extends HelloMessage {
  get style() {
    return html`<style> p { text-transform: uppercase } </style>`;
  }
}

customElements.define(LoudMessage.is, LoudMessage);
customElements.define(HelloMessage.is, HelloMessage);
