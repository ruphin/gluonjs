import { GluonElement, html } from '/gluon-lite.js';

class MessageContainer extends GluonElement {
  get template() {
    return html`<div>Hello ${this.message}</div>`;
  }
}

customElements.define(MessageContainer.is, MessageContainer);
