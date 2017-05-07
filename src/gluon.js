(Gluon => {
  class GluonElement extends HTMLElement {
    constructor() {
      super();
      this._attachTemplate();
      this._createElementCache();
    }
    _attachTemplate() {
      let template = this.constructor._document.getElementById(`${this.constructor.is}-template`);
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
