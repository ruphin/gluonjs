import { Gluon } from '/src/gluon.js';
import { GluonCode } from '/pages/gluonjs-code.js';

const javascriptExample = `import { Gluon } from '/src/gluon.js';

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

Gluon.define(GluonCode.is, GluonCode);`;

const htmlExample = `<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js"></script>

<template id="gluonjs-code-template">
  <link rel="stylesheet" href="pages/gluonjs-code.css">
  <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/github.min.css">
  <div class="code"><pre class="highlight"><code id="code"></code></pre></div>
</template>
`;

export class GluonDocs extends Gluon.Element {
  static get template() {
    return 'gluonjs-docs.html';
  }
  static get is() {
    return 'gluonjs-docs';
  }

  connectedCallback() {
    this.$.javascript_example.language = 'javascript';
    this.$.javascript_example.sourceText = javascriptExample;
    this.$.html_example.language = 'html';
    this.$.html_example.sourceText = htmlExample;
  }
}

Gluon.define(GluonDocs.is, GluonDocs);
