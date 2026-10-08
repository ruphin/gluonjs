import { defineConfig } from "vitest/config";

const license =
  "/** @license Copyright (c) 2026 Goffert van Gool, SPDX-License-Identifier: MIT */";

// Library build + test configuration.
// The dev page has its own config in dev/vite.config.ts.
//
// `vite build` produces `dist/index.js`, an ES module that imports lite-html, for bundlers and import maps.
// `vite build --mode bundle` produces `dist/gluon.min.js`, a minified ES module with lite-html included, for unpkg.
export default defineConfig(({ mode }) => {
  const bundle = mode === "bundle";
  return {
    build: {
      emptyOutDir: !bundle,
      lib: {
        entry: "src/index.ts",
        formats: ["es"],
      },
      rolldownOptions: {
        // lite-html is a dependency in package.json, so it is not bundled into dist/index.js
        external: bundle ? [] : ["lite-html"],
        output: {
          format: "es",
          entryFileNames: bundle ? "gluon.min.js" : "index.js",
          minify: bundle,
          postBanner: license,
        },
      },
    },
    test: {
      environment: "jsdom",
      include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    },
  };
});
