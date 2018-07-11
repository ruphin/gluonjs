import { html, GluonElement } from '../src/gluon.js';

class TestApp extends GluonElement {
  get template() {
    return html`
      <div>ROOT: ${this.four}</div>
      <sub-component id="sub" four=${this.four} blocker=${this.blocker}></sub-component>
    `;
  }

  static get blockingProperties() {
    return ['four'];
  }

  connectedCallback() {
    super.connectedCallback();
    window.setTimeout(() => {
      this.four = 2 + 2;
    }, 1000);
    window.setTimeout(() => {
      this.blocker = 5;
    }, 2000);
  }

  set blocker(value) {
    this._blocker = value;
    this.render();
  }
  get blocker() {
    return this._blocker;
  }
}

class SubComponent extends GluonElement {
  constructor() {
    super();
    console.log('SUB - CONSTRUCTOR: ', String(this.four));
  }

  static get blockingProperties() {
    return ['four', 'blocker'];
  }

  get template() {
    return html`
      <div>SUB: ${this.four}</div>
      <leaf-component four=${this.four}></leaf-component>`;
  }

  set four(value) {
    console.log('SUB - SET PROP: ', String(value));
    this._four = value;
    this.render();
  }
  get four() {
    console.log('SUB - GET PROP: ', String(this._four));
    return this._four;
  }
}

class BaseComponent extends GluonElement {
  get five() {
    return this._five;
  }
  set five(value) {
    this._five = value;
  }
}

class LeafComponent extends BaseComponent {
  constructor() {
    super();
    console.log('LEAF - CONSTRUCTOR: ', String(this.four));
    const four = this.four;
    delete this.four;
    this.four = four;
  }

  static get blockingProperties() {
    return ['five'];
  }

  get template() {
    return html`
      <div>LEAF: ${this.five}</div>
    `;
  }

  set four(value) {
    this.five = value + 1;
    this.render();
  }

  get four() {
    return this.five - 1;
  }
}

customElements.define(TestApp.is, TestApp);
customElements.define(SubComponent.is, SubComponent);
customElements.define(LeafComponent.is, LeafComponent);
