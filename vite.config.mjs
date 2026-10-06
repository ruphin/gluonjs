import { defineConfig } from 'vite';

// The published `gluon.js` is an unbundled ES module that imports lit-html via a
// relative path, so it works directly in browsers from `node_modules/@gluon/gluon/`
// without a build step or import map.
const LIT_HTML = 'lit-html/lib/shady-render.js';

export default defineConfig(({ command, mode }) => {
  if (mode === 'test') {
    return {
      test: {
        environment: 'jsdom',
        include: ['test/**/*.test.js']
      }
    };
  }

  if (command === 'serve') {
    return {
      root: 'examples',
      server: { port: 5000 },
      preview: { port: 5000 }
    };
  }

  const umd = mode === 'umd';
  return {
    publicDir: false,
    build: {
      outDir: '.',
      emptyOutDir: false,
      copyPublicDir: false,
      minify: false,
      sourcemap: umd,
      target: 'es2017',
      lib: {
        entry: 'src/gluon.js',
        name: 'GluonJS',
        formats: [umd ? 'umd' : 'es'],
        fileName: () => (umd ? 'gluon.umd.js' : 'gluon.js')
      },
      rollupOptions: umd
        ? {}
        : {
            external: [LIT_HTML],
            output: { paths: { [LIT_HTML]: `../../${LIT_HTML}` } }
          }
    }
  };
});
