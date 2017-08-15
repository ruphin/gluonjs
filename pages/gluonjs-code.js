{
  const _source = document.currentScript;
  class GluonCode extends Gluon.Element {
    static get _source() {
      return _source;
    }
    static get is() {
      return 'gluonjs-code';
    }
    set sourceText(code) {
      this.$.code.innerText = code;
      this.$.code.classList.add(this.language);
      hljs.highlightBlock(this.$.code);
    }
  }

  customElements.define(GluonCode.is, GluonCode);
}
