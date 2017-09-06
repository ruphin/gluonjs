import { GluonElement, html } from '../src/gluon.js';
import { GluonCode } from './gluonjs-code.js';

export class GluonDocs extends GluonElement {
  get template() {
    return html`
<link rel="stylesheet" href="/cayman.css">
<section class="page-header">
  <h1 class="project-name">Gluonjs 2.0</h1>
  <h2 class="project-tagline">Web Components in an ES6 Module world</h2>
  <a href="https://gluonjs.ruph.in" class="btn">About Gluonjs</a>
  <a href="https://github.com/ruphin/gluonjs/tree/es6-modules" class="btn">View on GitHub</a>
</section>
<section class="main-content">
  <h1>Web Components and ES6 Modules</h1>
  <p>HTML Imports are being deprecated, which means we are moving towards ES6 modules as the future native import system on the web platform.</p>
  <p>This is an exploration of what near-native Web Components could look like in that future.</p>

  <hr>
  <h1>About Gluonjs</h1>
  <p><a href="https://gluonjs.ruph.in/">Gluonjs</a> is a minimal Web Component framework designed for simplicity and speed. It borrows some ideas from <a href="https://www.polymer-project.org/">Polymer</a>, but is mostly based on platform features. <a href="https://github.com/ruphin/gluonjs/blob/es6-modules/src/gluon.js">The ES6 module version of Gluonjs</a> currently clocks in at ~40 lines of javascript.</p>
  <p>It leans heavily on  <a href="https://github.com/PolymerLabs/lit-html">lit-html</a> as a core templating and rendering engine.</p>

  <hr>

  <h1>Current Status</h1>
  <p>This website runs on Gluonjs ES6 module Web Components. :)</p>
  <p></p>
  <h2>Examples</h2>
  <p>The code snippets on this page are Gluonjs elements. This is what the definition of the <code>gluon-code</code> element looks like:</p>
  <gluon-code language="javascript">
    <template>
/* gluon-code.js */
import { GluonElement, html } from '/src/gluon.js';
import '/node_modules/highlight/highlight.min.js';

export class GluonCode extends GluonElement {

  get template() {
    return html\`
  <style>
    .code pre {
      border: solid 1px #dce6f0;
      border-radius: 0.3rem;
      ...
    }
  </style>
  <link rel="stylesheet" href="/node_modules/highlight/styles/monokai-sublime.min.css">
  <div class="code">
    <pre class="highlight"><code id="code"></code></pre>
  </div>
\`;
  }

  connectedCallback() {
    this.$.code.innerText = this.querySelector('template').innerHTML;
    this.$.code.classList.add(this.getAttribute('language'));
    hljs.highlightBlock(this.$.code);
  }
}

customElements.define(GluonCode.is, GluonCode);
    </template>
  </gluon-code>
  <p>This looks nearly identical to vanilla Custom Elements. The template is defined in the <code>template</code> getter, using lit-html's <code>html</code> template tag. A Gluonjs element automatically renders any template when it is attached to the DOM.</p>

  <p>Gluonjs creates an element reference map in the <code>$</code> attribute. It also automatically uses your element's name to default to a sensible tag, which is available through the <code>is</code> property on your element's class. You can choose another tagname by setting the <code>is</code> property on your class.</p>

  <p>This is how to use the <code>&lt;gluon-code&gt;</code> element:</p>
  <gluon-code language="html">
    <template>
/* index.html */
<script type="module" src="/pages/gluon-code.js"></script>
<gluon-code language="javascript">
  <template>
const TAG = Symbol('tag');
const NEEDSRENDER = Symbol('needsRender');
...
  </template>
</gluon-code>
    </template>
  </gluon-code>
  <p>The element is loaded with a <code>&lt;script script type="module"&gt;</code>. The highlighting language is set as an attribute, and the code is inlined in a template inside the <code>&lt;gluon-code&gt;</code> element.</p>
  <hr>

  <h1>Outstanding Issues</h1>
  <p>There are several outstanding issues</p>
  <h2>Relative links from ES6 modules</h2>
  <p>At the moment there is no <code>document.currentScript</code> equivalent for ES6 modules. This means relative URLs within our element .js files cannot be correctly resolved. This is problematic when loading files or referring to other resources from your component.</p>
  <p>Proposed solution is to have a global setting for the location of the node_modules folder or equivalent (assuming all modules are loaded from such a folder), which allows a module to load files relative from this folder.</p>

  <h2>Bundling / building for production</h2>
  <p>Not every browser can natively handle ES6 modules, so for production purposes (if you want to support all browsers) you will need a build step. Webpack is a promising tool to bundle your ES6 module components into a single app.js file that can be loaded as a single resource, and can be set up with minimal effort. Lazy-loading and application fragments require more work, and there is much room for improvement in this area.</p>

  <h2>Code highlighting / editor features</h2>
  <p>Editing HTML within JS files does not make my texteditor happy.</p>

  <h1>Contributing</h1>
  <p>All work on this project happens in the open on <a href="https://github.com/ruphin/gluonjs/tree/es6-modules">Github</a>. The easiest way to get started is to fork and run <code>npm install &amp;&amp; npm run dev</code> Feel free to fork and tinker with it, or create issues or pull requests.</p>

</section>
`;
  }
}

customElements.define(GluonDocs.is, GluonDocs);
