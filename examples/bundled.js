const html = GluonJS.html;
const GluonElement = GluonJS.GluonElement;

class HelloMessage extends GluonElement {
  get template() {
    return html`<p>Hello ${this.getAttribute('name')}</p>`;
  }
}

customElements.define(HelloMessage.is, HelloMessage);
