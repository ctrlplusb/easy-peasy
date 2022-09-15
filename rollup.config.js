import path from 'path';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';
import pkg from './package.json';

const babelRuntimeVersion = pkg.dependencies['@babel/runtime'].replace(
  /^[^0-9]*/,
  '',
);

const { root } = path.parse(process.cwd());

const external = (id) => !id.startsWith('.') && !id.startsWith(root);

const extensions = ['.js'];

function createESMConfig(input, output) {
  return {
    input,
    output: { sourcemap: true, file: output, format: 'esm' },
    external,
    plugins: [
      resolve({ extensions }),
      babel({
        extensions,
        plugins: [
          ['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }],
        ],
        runtimeHelpers: true,
        sourceMaps: true,
        inputSourceMap: true,
      }),
      sizeSnapshot(),
    ],
  };
}

function createCommonJSConfig(input, output) {
  return {
    input,
    output: { sourcemap: true, file: output, format: 'cjs', exports: 'named' },
    external,
    plugins: [
      resolve({ extensions }),
      babel({
        extensions,
        plugins: [
          ['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }],
        ],
        runtimeHelpers: true,
        sourceMaps: true,
        inputSourceMap: true,
      }),
      sizeSnapshot(),
    ],
  };
}

function createIIFEConfig(input, output, globalName) {
  return {
    input,
    output: {
      sourcemap: true,
      file: output,
      format: 'iife',
      exports: 'named',
      name: globalName,
      globals: {
        react: 'React',
        '@babel/runtime/helpers/objectSpread2': '_objectSpread',
        redux: 'Redux',
        'redux-thunk': 'reduxThunk',
        immer: 'immer',
        equal: 'fast-deep-equal/es6',
      },
    },
    external,
    plugins: [
      resolve({ extensions }),
      babel({
        extensions,
        plugins: [
          ['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }],
        ],
        runtimeHelpers: true,
        sourceMaps: true,
        inputSourceMap: true,
      }),
      sizeSnapshot(),
    ],
  };
}

export default [
  createESMConfig('src/index.js', 'dist/index.js'),
  createCommonJSConfig('src/index.js', 'dist/index.cjs.js'),
  createIIFEConfig('src/index.js', 'dist/index.iife.js', 'easyPeasy'),
];
