let Gluon = window.Gluon || console.warn("Gluon base not set. Falling back to '/elements/'") || { base: '/elements/' };

// Symbol key for storing the template in element class
const TEMPLATE = Symbol('template');
const TEMPLATEREQUEST = Symbol('templateRequest');

// Symbol keys for private methods
const ATTACHTEMPLATE = Symbol('attachTemplate');
const CREATEIDCACHE = Symbol('createIdCache');

// Globals for resolveUrl
const ABS_URL = /(^\/)|(^#)|(^[\w-\d]*:)/;
let workingURL;
let resolveDoc;

let elementsToLoad = {};
class GluonElement extends HTMLElement {
  constructor() {
    super();
    if (this.constructor[TEMPLATE]) {
      this[ATTACHTEMPLATE]();
      this[CREATEIDCACHE]();
      this.ready();
    } else {
      if (elementsToLoad[this.constructor]) {
        elementsToLoad[this.constructor].push(this);
      } else {
        elementsToLoad[this.constructor] = [this];
      }
    }
  }

  static loadTemplate() {
    const templateFile = `${Gluon.base}${this.is}/${this.is}.html`;
    const request = new XMLHttpRequest();
    this[TEMPLATEREQUEST] = request;
    request.open('GET', templateFile, true);
    request.onload = () => {
      // Servers redirecting an import can add a Location header to help us
      // polyfill correctly. Handle relative and full paths.
      // Prefer responseURL which already resolves redirects
      // https://xhr.spec.whatwg.org/#the-responseurl-attribute
      let redirectedUrl = request.responseURL || request.getResponseHeader('Location');
      if (redirectedUrl && redirectedUrl.indexOf('/') === 0) {
        // In IE location.origin might not work
        // https://connect.microsoft.com/IE/feedback/details/1763802/location-origin-is-undefined-in-ie-11-on-windows-10-but-works-on-windows-7
        const origin = location.origin || location.protocol + '//' + location.host;
        redirectedUrl = origin + redirectedUrl;
      }
      const resource /** @type {string} */ = request.response || request.responseText;
      // if (request.status === 304 || request.status === 0 || (request.status >= 200 && request.status < 300)) {
      //   success(resource, redirectedUrl);
      // } else {
      //   fail(resource);
      // }
      const template = document.createElement('template');
      template.innerHTML = resource;
      this[TEMPLATE] = template;
      if (elementsToLoad[this]) {
        elementsToLoad[this].forEach(e => {
          e[ATTACHTEMPLATE]();
          e[CREATEIDCACHE]();
          e.ready && e.ready();
        });
      }
    };
    request.send();
  }

  // Helper method to resolve an URL relative to the element's source location.
  resolveUrl(url, baseURI) {
    if (url && ABS_URL.test(url)) {
      return url;
    }

    // Get the base URI of our element. Fallback to window.location
    if (!baseURI) {
      baseURI = (this.constructor._source && this.constructor._source.baseURI) || window.location.href;
    }

    // Feature detect URL
    if (workingURL === undefined) {
      workingURL = false;
      try {
        const u = new URL('b', 'http://a');
        u.pathname = 'c%20d';
        workingURL = u.href === 'http://a/c%20d';
      } catch (e) {
        // silently fail
      }
    }

    if (workingURL) {
      return new URL(url, baseURI).href;
    }

    // Fallback to creating an anchor into a disconnected document.
    if (!resolveDoc) {
      resolveDoc = document.implementation.createHTMLDocument('temp');
      resolveDoc.base = resolveDoc.createElement('base');
      resolveDoc.head.appendChild(resolveDoc.base);
      resolveDoc.anchor = resolveDoc.createElement('a');
      resolveDoc.body.appendChild(resolveDoc.anchor);
    }
    resolveDoc.base.href = baseURI;
    resolveDoc.anchor.href = url;
    return resolveDoc.anchor.href || url;
  }
}

GluonElement.prototype[ATTACHTEMPLATE] = function() {
  // If we have not initialized the template for this Element
  if (this.constructor[TEMPLATE] === undefined) {
    // Find the template in the source document of this Element
    let template = this.constructor._source && this.constructor._source.ownerDocument.getElementById(`${this.constructor.is}-template`);

    // If we find a template, prepare it and store the prepared template in the Element class
    if (template) {
      if (window.ShadyCSS) {
        window.ShadyCSS.prepareTemplate(template, this.constructor.is);
      }
      this.constructor[TEMPLATE] = template;
    } else {
      // If we cannot find a template in the source document, disable templating for this Element
      console.debug(`No template found for ${this.constructor.is}`);
      this.constructor[TEMPLATE] = false;
      return;
    }
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

export { Gluon };
