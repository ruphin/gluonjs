import { render } from '../@ruphin/lit-html/lib/shady-render.js';
export { html } from '../@ruphin/lit-html/lib/lit-extended.js';

const TAG = Symbol('tag');
const NEEDSRENDER = Symbol('needsRender');

const camelToKebab = camel => camel.replace(/([a-z](?=[A-Z]))|([A-Z](?=[A-Z][a-z]))/g, '$1$2-').toLowerCase();

const createIdCache = element => {
  element.$ = {};
  element.shadowRoot.querySelectorAll('[id]').forEach(el => {
    element.$[el.id] = el;
  });
};

export class GluonElement extends HTMLElement {
  static get is() {
    return (this.hasOwnProperty(TAG) && this[TAG]) || (this[TAG] = camelToKebab(this.name));
  }
  connectedCallback() {
    if ('template' in this) {
      this.attachShadow({ mode: 'open' });
      this.render({ sync: true });
      createIdCache(this);
    }
  }
  // Render the element's template.
  // By default, renders are asynchronous and executed at the next microtask timing,
  // so multiple render calls are batched.
  // If the sync option is set to `true`, it renders synchronously instead.
  // Returns a Promise that resolves when the render is completed.
  async render({ sync = false } = {}) {
    this[NEEDSRENDER] = true;
    if (!sync) {
      await 0;
    }
    if (this[NEEDSRENDER]) {
      this[NEEDSRENDER] = false;
      render(this.template, this.shadowRoot, this.constructor.is);
    }
  }
}
