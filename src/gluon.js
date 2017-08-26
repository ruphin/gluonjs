let Gluon = window.Gluon || console.warn("Gluon base not set. Defaulting to '/node_modules/'") || { base: '/node_modules/' };

// Symbol key for storing the template in element class
const TEMPLATE = Symbol('template');

// Symbol keys for private methods
const ATTACHTEMPLATE = Symbol('attachTemplate');
const CREATEIDCACHE = Symbol('createIdCache');

// Queue for resources to be loaded
const RESOURCEQUEUE = [];
let loadingResources = false;

class GluonElement extends HTMLElement {
  constructor() {
    super();
    this[ATTACHTEMPLATE]();
    this[CREATEIDCACHE]();
  }
}

GluonElement.prototype[ATTACHTEMPLATE] = function() {
  // If we have not initialized a template for this Element
  if (this.constructor[TEMPLATE] === undefined) {
    console.debug(`No template found for ${this.constructor.is}`);
    this.constructor[TEMPLATE] = false;
    return;
  }

  // If the Element has a stored template, create a shadowRoot and insert a clone of our template
  if (this.constructor[TEMPLATE]) {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(this.constructor[TEMPLATE].content.cloneNode(true));
  }
};

// Create a map of all Elements in our template with an id
GluonElement.prototype[CREATEIDCACHE] = function() {
  if (this.shadowRoot) {
    this.$ = {};
    this.shadowRoot.querySelectorAll('[id]').forEach(element => {
      this.$[element.id] = element;
    });
  }
};

Gluon.Element = GluonElement;

let loadResource = () => {
  const resource = RESOURCEQUEUE.pop();
  if (resource === undefined) {
    loadingResources = false;
  } else if (resource.type === 'element') {
    customElements.define(resource.tag, resource.element);
    loadResource();
  } else if (resource.type === 'script') {
    const s = document.createElement('script');
    Array.from(resource.script.attributes).forEach(attr => {
      s.setAttribute(attr.name, attr.value);
    });
    s.addEventListener('load', () => {
      loadResource();
    });
    document.head.appendChild(s);
  } else {
    console.warn('Skipping unknown resource', resource);
    loadResource();
  }
};

Gluon.define = (tag, element) => {
  if (!element.template) {
    console.debug(`Loading ${tag} without template`);
    if (!loadingResources) {
      loadingResources = true;
      loadResource();
    }
  } else {
    const templateFile = `${Gluon.base}${element.template}`;
    const request = new XMLHttpRequest();

    RESOURCEQUEUE.unshift({ type: 'element', tag, element });
    request.open('GET', templateFile, true);
    request.onload = () => {
      const resource = request.response || request.responseText;
      if (request.status === 304 || request.status === 0 || (request.status >= 200 && request.status < 300)) {
        const template = document.createElement('template');
        template.innerHTML = resource;
        const namedTemplate = template.content.querySelector(`#${tag}-template`);

        element[TEMPLATE] = namedTemplate || template;

        if (window.ShadyCSS) {
          window.ShadyCSS.prepareTemplate(element[TEMPLATE], tag);
        }

        let index =
          RESOURCEQUEUE.findIndex(r => {
            return r.element === element;
          }) + 1;
        //  There is a better way to do this
        Array.from(template.content.querySelectorAll('script')).forEach(script => {
          RESOURCEQUEUE.splice(index, 0, { type: 'script', script });
        });
        if (!loadingResources) {
          loadingResources = true;
          loadResource();
        }
      } else {
        console.warn(`Failed to load template for ${tag}`);
        if (!loadingResources) {
          loadingResources = true;
          loadResource();
        }
      }
    };
    request.send();
  }
};

export { Gluon };
