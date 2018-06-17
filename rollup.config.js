import filesize from 'rollup-plugin-filesize';
import uglify from 'rollup-plugin-uglify';
import babel from 'rollup-plugin-babel';
import includePaths from 'rollup-plugin-includepaths';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import * as path from 'path';

const includePathOptions = {
  paths: ['node_modules/@gluon/gluon', '.'],
  extensions: ['.js']
};

function getConfig({ dest, format, uglified = true, transpiled = false, bundled = true }) {
  const conf = {
    input: 'src/gluon.js',
    output: { exports: 'named', file: dest, format, name: 'GluonJS', sourcemap: uglified },
    external: bundled ? [] : [path.resolve('./lit-html/lib/lit-extended.js'), path.resolve('./lit-html/lib/shady-render.js')],
    plugins: [
      bundled && includePaths(includePathOptions),
      transpiled && resolve(),
      transpiled &&
        commonjs({
          include: 'node_modules/**'
        }),
      transpiled &&
        babel({
          presets: [['env', { modules: false }]],
          plugins: ['external-helpers']
        }),
      uglify({
        warnings: true,
        toplevel: uglified,
        sourceMap: uglified,
        compress: uglified && { passes: 2 },
        mangle: uglified,
        output: { beautify: !uglified }
      }),
      filesize()
    ].filter(Boolean)
  };

  return conf;
}

const example = ({ uglified = false } = {}) => {
  return {
    input: 'examples/index.js',
    output: { file: 'examples/index.nomodule.js', format: 'iife', sourcemap: false },
    plugins: [
      includePaths(includePathOptions),
      babel({
        presets: [['env', { modules: false }]],
        plugins: ['external-helpers']
      }),
      uglified && uglify({ warnings: true, toplevel: true, keep_fnames: true, sourceMap: true, compress: { passes: 2 }, mangle: { keep_fnames: true } }),
      filesize()
    ].filter(Boolean)
  };
};

const config = [
  getConfig({ dest: 'gluon.es5.js', format: 'iife', transpiled: true }),
  getConfig({ dest: 'gluon.umd.js', format: 'umd' }),
  example({ uglified: true })
];

export default config;
