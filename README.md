# About Gluonjs

[Gluonjs](https://gluonjs.ruph.in/) is a minimal Web Component framework designed for simplicity and speed. It borrows some ideas from [Polymer](https://www.polymer-project.org/), but is mostly based on platform features. [The source](https://github.com/ruphin/gluonjs/blob/es6-modules/src/gluon.js) for the ES6 version is only ~100 lines of javascript.

# HTML Import system

Unfortunately, HTML Imports is being deprecated. This leaves us with ES6 modules as the only native import system on the web. This is fine in theory, we can load our Web Components as ES6 modules, but an unfortunate side-effect is that we are left to embed our HTML in JavaScript files.
We are seeing some excellent projects such as [lit-html](https://github.com/PolymerLabs/lit-html) to help with this situation, but a part of the Web Component community strongly prefers to keep their HTML in .html files. This project is an experiment to find alternative ways to load HTML in the ES6 module ecosystem.

# Current Status

[This website](https://gluones6.ruph.in) loads Web Components as ES6 modules, and fetches HTML templates from html files. So all the basics are in place :)
However, we have to compromise on several points to get this to work

## Example code

This is what a Web Component module looks like with Gluon currently

```javascript
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
```

The major compromise here is that we have to use `Gluon.define(...)` instead of `customElements.define(...)`. This is unavoidable, because we must defer the registration of components until their templates are loaded. Furthermore, we need to tell the component where to find the source for the element, with the static `template` property. It is possible to encode some smart behaviours here such as attempting to infer this filename from the `is` property, or something similar. It should be possible to automatically detect if the template is a file reference, a template in string form, or a reference to an existing `<template>` element, for maximum flexibility.

This is what an HTML template file looks like.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js"></script>

<template id="gluonjs-code-template">
  <link rel="stylesheet" href="pages/gluonjs-code.css">
  <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/github.min.css">
  <div class="code"><pre class="highlight"><code id="code"></code></pre></div>
</template>
```

At the moment, Gluonjs attempts to find a template within the html template file with id ``${element.is}-template`. If this fails, the entire contents of the file are treated as the template. This leaves maximum flexibility in situations where multiple element templates are defined in one file.
If this file contains scripts, they are guaranteed to be loaded in-order, and before the element registers, similar to how the current HTML Imports behave. The current HTML Imports polyfill could be adapted to perform this resource loading. A mechanism to fix relative URLs is still needed.
* * *

# Outstanding Issues

here are several outstanding issues

## Relative links from ES6 modules
At the moment there is no `document.currentScript` equivalent for ES6 modules. This means relative URLs within our element .js files cannot be correctly resolved.
Proposed solution is to have a global setting for the location of the `node_modules` folder or equivalent (assuming all modules are loaded from such a folder), which allows a module to load files relative from this folder.

## Bundling / building for production
This whole area is still unexplored. It is probably desirable to bundle multiple element templates into a single file, but this will create problems with relative URLs and namespace conflicts.

# Contributing
All work on this project happens in the open on [Github](https://github.com/ruphin/gluonjs/tree/es6-modules). The easiest way to get started is to fork and run `npm install && npm run dev` on the es6-modules branch. Feel free to fork and tinker with it, and create issues or pull requests.
