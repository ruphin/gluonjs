{
  const source = document.currentScript;

  const minimalExampleSource = `class MyElement extends Gluon.Element {
  static get is() {
    return 'my-element';
  }
}

customElements.define(MyElement.is, MyElement);`;

  const templateExampleSource = `<template id="my-element-template">
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
</script>`;

  const lookupExampleSource = `<template id="my-element-template">
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
</script>`;

  const resolverExampleSource = `<template id="my-element-template">
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
</script>`;

  class GluonDocs extends Gluon.Element {
    static get _source() {
      return source;
    }
    static get is() {
      return 'gluonjs-docs';
    }
    connectedCallback() {
      this.$.minimal_example.language = 'javascript';
      this.$.minimal_example.sourceText = minimalExampleSource;
      this.$.template_example.language = 'html';
      this.$.template_example.sourceText = templateExampleSource;
      this.$.lookup_example.language = 'html';
      this.$.lookup_example.sourceText = lookupExampleSource;
      this.$.resolver_example.language = 'html';
      this.$.resolver_example.sourceText = resolverExampleSource;
    }
  }

  customElements.define(GluonDocs.is, GluonDocs);
}
