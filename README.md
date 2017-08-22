# Philosophy

Gluonjs is designed for developers who like to work with vanilla web components and platform-based tools. It takes care of most boilerplate when writing native web components, allowing you to focus more on the content, and write leaner code.

## Gluonjs is

*   Designed to work like native web components. No library-specific semantics
*   Super lightweight. Only 1.8Kb unzipped
*   So fast it's silly. Easily the fastest component library out there
*   Compatible with everything. Adheres to web component standards
*   Easy to install and deploy. Use Bower, NPM, or just download the zip

## Gluonjs is great for

*   Developers who like to work with standards
*   Quick prototypes
*   Internal projects
*   Highly portable components
*   Websites that don't care about IE

* * *

# Features

The main feature of Gluonjs is simplicity. A minimal element definition with Gluonjs is exactly like using native web components.

```javascript
class MyElement extends Gluon.Element {
  static get is() {
    return 'my-element';
  }
}

customElements.define(MyElement.is, MyElement);
```

On top of that, it adds a few useful features that solve common issues with web components.

## Template stamping

When your web component requires a template, all you need to do is set the static `_source` property on your element. Gluonjs will prepare the template for your element, and stamp it to the Shadow DOM of each instance.

```html
<template id="my-element-template">
  <span>A simple template</span>
</template>

<script>
{
  const source = document.currentScript;
  class MyElement extends Gluon.Element {
    static get _source() {
      return source;
    }
    static get is() {
      return 'my-element';
    }
  }

  customElements.define(MyElement.is, MyElement);
}
</script>
```

## Element lookup map

Gluonjs automatically creates `this.$` which maps all elements in the template with an ID.

```html
<template id="my-element-template">
  <span id="counter"></span>
</template>

<script>
{
  class MyElement extends Gluon.Element {
    ...
    constructor() {
      super();
      this.count = 0;
    }
    connectedCallback() {
      this.$.counter.textContent = this.count;
    }
  }
}
</script>
```

## URL resolver

Easily resolve URLs relative to your element's source with `this.resolveUrl()`.

```html
<template id="my-element-template">
  <img id="avatar">
</template>

<script>
{
  class MyElement extends Gluon.Element {
    ...
    setAvatar(name) {
      this.$.avatar.src = this.resolveUrl(\`avatars/\${name}.png\`);
    }
  }
}
</script>
```

* * *

# Browser support

Gluonjs is supported by all evergreen browsers. To keep the codebase lean and fast, IE is not supported.

| IE | Edge | Chrome | Firefox | Safari |
|:--:|:----:|:------:|:-------:|:------:|
|  ✗ |  ✔*  |    ✔   |    ✔*   |   ✔*   |

*With web component [polyfill](https://github.com/webcomponents/webcomponentsjs)
