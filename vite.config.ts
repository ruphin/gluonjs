import { defineConfig } from 'vitest/config';

const license = '/** @license Copyright (c) 2026 Goffert van Gool, SPDX-License-Identifier: MIT */';

// `vite build` produces `dist/gluon.js`, an ES module that imports lite-html, for bundlers and import maps.
// `vite build --mode bundle` produces `dist/gluon.min.js`, a minified ES module with lite-html included, for unpkg.
export default defineConfig(({ mode }) => {
  const bundle = mode === 'bundle';
  return {
    build: {
      emptyOutDir: !bundle,
      lib: {
        entry: 'src/gluon.ts',
        formats: ['es'],
      },

      rolldownOptions: {
        external: bundle ? [] : ['lite-html'],
        output: {
          format: 'es',
          entryFileNames: bundle ? 'gluon.min.js' : 'gluon.js',
          minify: bundle,
          postBanner: license,
        },
      },
    },
    test: {
      environment: 'jsdom',
      include: ['test/**/*.test.ts'],
    },
  };
});
