import filesize from 'rollup-plugin-filesize';
import uglify from 'rollup-plugin-uglify';
import { uglifier } from 'uglify-es';
import babel from 'rollup-plugin-babel';
import includePaths from 'rollup-plugin-includepaths';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import * as path from 'path';

const includePathOptions = {
  paths: ['node_modules/gluonjs', '.'],
  extensions: ['.js']
};

function getConfig({ dest, format, uglified = true, transpiled = false, bundled = true }) {
  const conf = {
    input: 'src/gluon.js',
    output: { exports: 'named', file: dest, format, name: 'GluonJS', sourcemap: true },
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
        plugins: ['transform-runtime'],
        runtimeHelpers: true,
        exclude: 'node_modules/**'
      }),
      uglified && uglify({ warnings: true, toplevel: !transpiled, sourceMap: true, compress: { passes: 2 }, mangle: { properties: false } }, uglifier),
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
      uglified &&
      uglify({ warnings: true, keep_fnames: true, sourceMap: true, compress: { passes: 2 }, mangle: { properties: false, keep_fnames: true } }, uglifier),
      filesize()
    ].filter(Boolean)
  };
};

const config = [
  getConfig({ dest: 'gluon.es5.js', format: 'iife', transpiled: true }),
  getConfig({ dest: 'gluon.umd.js', format: 'umd' }),
  getConfig({ dest: 'gluon.js', format: 'es', bundled: false }),
  example({ uglified: false })
];

export default config;
