import { GluonElement, html } from '/gluon.js';
import '/messageContainer.js';

class HelloMessage extends GluonElement {
  get template() {
    return html`<message-container message="${this.getAttribute('message')}"></message-container>`;
  }
}

customElements.define(HelloMessage.is, HelloMessage);
