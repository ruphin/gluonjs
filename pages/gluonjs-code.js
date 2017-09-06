import { GluonElement, html } from '../src/gluon.js';
import 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js';

export class GluonCode extends GluonElement {
  get template() {
    return html`
  <style>
    .code pre {
      border: solid 1px #dce6f0;
      border-radius: 0.3rem;
    }
    .code pre > code {
      padding: 1.2rem;
      font-size: 0.9rem;
      line-height: 1.4;
      border-radius: 0.3rem;
    }
  </style>
  <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/monokai-sublime.min.css">
  <div class="code"><pre class="highlight"><code id="code"></code></pre></div>
`;
  }

  connectedCallback() {
    let code = this.querySelector('template').innerHTML.replace(/(?:^[\s]*\n)|(?:[\s\n]*$)/g, '');
    this.$.code.innerText = code;
    this.$.code.classList.add(this.getAttribute('language'));
    hljs.highlightBlock(this.$.code);
  }
}

customElements.define(GluonCode.is, GluonCode);
