(Gluon => {
  // Exit if Gluon.Element is already defined
  if (Gluon.Element) { return; }

  // Symbol key for storing the template in element class
  const TEMPLATE = Symbol('template');

  // Symbol keys for private methods
  const ATTACHTEMPLATE = Symbol('attachTemplate');
  const CREATEIDCACHE = Symbol('createIdCache');

  // Globals for resolveUrl
  const ABS_URL = /(^\/)|(^#)|(^[\w-\d]*:)/;
  let workingURL;
  let resolveDoc;

  class GluonElement extends HTMLElement {
    constructor() {
      super();
      this[ATTACHTEMPLATE]();
      this[CREATEIDCACHE]();
    }

    // Helper method to resolve an URL relative to the element's source location.
    resolveUrl(url, baseURI) {
      if (url && ABS_URL.test(url)) {
        return url;
      }

      // Get the base URI of our element. Fallback to window.location
      if (!baseURI) {
        baseURI = this.constructor._source && this.constructor._source.baseURI || window.location.href;
      }

      // Feature detect URL
      if (workingURL === undefined) {
        workingURL = false;
        try {
          const u = new URL('b', 'http://a');
          u.pathname = 'c%20d';
          workingURL = (u.href === 'http://a/c%20d');
        } catch (e) {
          // silently fail
        }
      }

      if (workingURL) {
        return (new URL(url, baseURI)).href;
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
      let template = (this.constructor._source && this.constructor._source.ownerDocument.getElementById(`${this.constructor.is}-template`));

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
      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(this.constructor[TEMPLATE].content.cloneNode(true));
    }
  }

  // Create a map of all Elements in our template with an id
  GluonElement.prototype[CREATEIDCACHE] = function() {
    if (this.shadowRoot) {
      this.$ = {};
      this.shadowRoot.querySelectorAll('[id]').forEach((element) => {
        this.$[element.id] = element;
      });
    }
  }

  Gluon.Element = GluonElement;
})(window['Gluon'] = (window['Gluon'] || {}));
