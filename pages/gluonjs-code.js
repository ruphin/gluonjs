import { Gluon } from '/src/gluon.js';

export class GluonCode extends Gluon.Element {
  static get template() {
    return 'gluonjs-code.html';
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

Gluon.define(GluonCode.is, GluonCode);
