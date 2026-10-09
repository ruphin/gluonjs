# Changelog

All notable changes to GluonJS are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [3.0.0] - 2026-10-09

GluonJS 3 is a rewrite in TypeScript on lite-html. The lists below cover what changed for an element written against 2.x.

### Added

- Reactive properties, declared in the static `properties` map of an element. A declared property requests an update when it changes. With `attribute: true` it is set from the attribute with its kebab-cased name, and with `reflect: true` it is written back to that attribute. The `type` and `converter` options control the conversion, and `hasChanged` the change detection.
- A batched update cycle. Changes are rendered once per microtask. `requestUpdate()`, `performUpdate()`, `updateComplete`, `isUpdatePending` and `hasUpdated` control and observe it, and the `shouldUpdate()`, `willUpdate()`, `update()`, `firstUpdated()` and `updated()` methods are called during it with the changed properties.
- Static `styles`: CSS text, a constructed `CSSStyleSheet`, or a list of them, adopted by the shadow root of every instance. The `css` tag marks CSS in template literals.
- `define(ElementClass, name, registry?)` registers an element class, and tolerates being called again with the same class.
- `disconnectSignal`, an `AbortSignal` that is aborted when the element is disconnected, for listeners and observers set up in `connectedCallback()`.
- Static `shadowRootOptions` for the shadow root that `createRenderRoot()` attaches.
- Type declarations: the project is written in TypeScript and the package ships `.d.ts` files for the public API.

### Changed

- Templates are rendered with [lite-html](https://github.com/ruphin/lite-html) instead of lit-html. The `html`, `svg` and `render` functions and the directives of lite-html are exported from `@gluon/gluon`.
- `render()` returns what the element renders, and is called by the update cycle. It replaces the `template` getter, and is no longer the method that schedules a render; use `requestUpdate()` and `performUpdate()` for that.
- An element renders after it is connected and its first update completes, instead of synchronously in `connectedCallback()`.
- The package entry point is the built ES module `dist/index.js`, which imports lite-html. The minified bundle `dist/gluon.min.js` includes lite-html and is what unpkg serves.

### Removed

- The `$` cache of nodes with an `id`. Query `renderRoot` instead.
- `static get is()`. Pass the tag name to `define()` or `customElements.define()`.
- `render({ sync: true })`. Call `performUpdate()` to update synchronously.
- Rendering through lit-html's `shady-render`, for the ShadyDOM and ShadyCSS polyfills.

## [2.5.3] - 2019-02-20

Last release of the 2.x line, built on lit-html.

[Unreleased]: https://github.com/ruphin/gluonjs/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/ruphin/gluonjs/compare/v2.5.3...v3.0.0
[2.5.3]: https://github.com/ruphin/gluonjs/releases/tag/v2.5.3
