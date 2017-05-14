(Gluon => {
  // Exit if we are already defined
  if (Gluon.Element) { return; }

  // Globals for resolveUrl
  let ABS_URL = /(^\/)|(^#)|(^[\w-\d]*:)/;
  let workingURL;
  let resolveDoc;

  class GluonElement extends HTMLElement {
    constructor() {
      super();
      this._attachTemplate();
      this._createElementCache();
    }

    // Helper method to resolve an URL relative to the element's source location.
    resolveUrl(url, baseURI) {
      if (url && ABS_URL.test(url)) {
        return url;
      }

      // Get the base URI of our element. Fallback to window.location
      if (!baseURI) {
        baseURI = this.constructor._source.baseURI || window.location.href;
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

    _attachTemplate() {
      // Find the template in the source document this element is defined in
      let template = this.constructor._source.ownerDocument.getElementById(`${this.constructor.is}-template`);

      // Required by Shady CSS Polyfill
      if (window.ShadyCSS) {
        window.ShadyCSS.prepareTemplate(template, this.constructor.is);
      }

      let content = template.content.cloneNode(true);
      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(content);
    }

    _createElementCache() {
      this.$ = {};
      this.shadowRoot.querySelectorAll('*').forEach((element) => {
        if (element.id) {
          this.$[element.id] = element;
        }
      });
    }
  }

  Gluon.Element = GluonElement;
})(window['Gluon'] = (window['Gluon'] || {}));
