import { render, html } from '../lit-html/lit-html.js';

export { html };

const TAG = Symbol('tag');
const NEEDSRENDER = Symbol('needsRender');
const SHADYTEMPLATE = Symbol('shadyTemplate');

const applyShadyCSS = element => {
  if (window.ShadyCSS) {
    if (element[SHADYTEMPLATE] === undefined) {
      element[SHADYTEMPLATE] = document.createElement('template');
      element[SHADYTEMPLATE].innerHTML = element.shadowRoot.innerHTML;
      ShadyCSS.prepareTemplate(element[SHADYTEMPLATE], element.localName);
    }
    ShadyCSS.styleElement(element);
  }
};

const camelToKebab = function(camel) {
  return camel.replace(/([a-z])([A-Z])|(.)([A-Z][a-z])/g, '$1$3-$2$4').toLowerCase();
};

const createIdCache = function(element) {
  element.$ = {};
  element.shadowRoot.querySelectorAll('[id]').forEach(el => {
    element.$[el.id] = el;
  });
};

export class GluonElement extends HTMLElement {
  static get is() {
    return this[TAG] || (this[TAG] = camelToKebab(this.name));
  }
  connectedCallback() {
    if ('template' in this) {
      this.attachShadow({ mode: 'open' });
      this.render({ sync: true });

      this.shadyTemplate = document.createElement('template');
      this.shadyPrepared = false;

      createIdCache(this);
    }
  }
  // Render the element's template.
  // By default, renders are asynchronous and executed at the next microtask timing,
  // so multiple render calls are batched.
  // If the sync option is set to `true`, it renders syncrhonously instead.
  render({ sync = false } = {}) {
    if (sync) {
      this[NEEDSRENDER] = false; // Cancel any existing render promise
      render(this.template, this.shadowRoot);
      applyShadyCSS(this);
    } else if (!this[NEEDSRENDER]) {
      // Debounce multiple render calls
      this[NEEDSRENDER] = true;
      Promise.resolve().then(() => {
        // Abort if we canceled this render promise
        if (this[NEEDSRENDER]) {
          this[NEEDSRENDER] = false;
          render(this.template, this.shadowRoot);
          applyShadyCSS(this);
        }
      });
    }
  }
}
