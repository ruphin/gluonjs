import { render, html } from '../lit-html/lit-html.js';

export { html };

export class GluonElement extends HTMLElement {
  static get is() {
    return this[TAG] || (this[TAG] = camelToKebab(this.name));
  }
  connectedCallback() {
    if ('template' in this) {
      this.attachShadow({ mode: 'open' });
      render(this.template, this.shadowRoot);
      createIdCache(this);
    }
  }
  render() {
    if (!this[NEEDSRENDER]) {
      this[NEEDSRENDER] = true;
      Promise.resolve().then(() => {
        this[NEEDSRENDER] = false;
        render(this.template, this.shadowRoot);
      });
    }
  }
}

const camelToKebab = function(camel) {
  return camel.replace(/([a-z])([A-Z])|(.)([A-Z][a-z])/g, '$1$3-$2$4').toLowerCase();
};

const TAG = Symbol('tag');
const NEEDSRENDER = Symbol('needsRender');

const createIdCache = function(element) {
  element.$ = {};
  element.shadowRoot.querySelectorAll('[id]').forEach(el => {
    element.$[el.id] = el;
  });
};
