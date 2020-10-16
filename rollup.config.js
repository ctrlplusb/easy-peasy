import path from 'path';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';

const createBabelConfig = require('./babel.config');

const { root } = path.parse(process.cwd());
const external = (id) => !id.startsWith('.') && !id.startsWith(root);
const extensions = ['.js'];
const getBabelOptions = (targets) => {
  const config = createBabelConfig({ env: (env) => env === 'build' }, targets);
  if (targets.ie) {
    config.plugins = [
      ...config.plugins,
      '@babel/plugin-transform-regenerator',
      ['@babel/plugin-transform-runtime', { helpers: true, regenerator: true }],
    ];
  }
  return {
    ...config,
    runtimeHelpers: targets.ie,
    extensions,
    sourceMaps: true,
    inputSourceMap: true,
  };
};

function createESMConfig(input, output) {
  return {
    input,
    output: { sourcemap: true, file: output, format: 'esm' },
    external,
    plugins: [
      babel(getBabelOptions({ node: 8 })),
      sizeSnapshot(),
      resolve({ extensions }),
    ],
  };
}

function createCommonJSConfig(input, output) {
  return {
    input,
    output: { sourcemap: true, file: output, format: 'cjs', exports: 'named' },
    external,
    plugins: [
      babel(getBabelOptions({ ie: 11 })),
      sizeSnapshot(),
      resolve({ extensions }),
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
        '@babel/runtime/helpers/extends': '_extends',
        '@babel/runtime/helpers/asyncToGenerator': '_asyncToGenerator',
        '@babel/runtime/regenerator': '_regeneratorRuntime',
        redux: 'Redux',
        'redux-thunk': 'reduxThunk',
        immer: 'immer',
        memoizerific: 'memoizerific',
        'use-memo-one': 'useMemoOne',
      },
    },
    external,
    plugins: [
      babel(getBabelOptions({ ie: 11 })),
      sizeSnapshot(),
      resolve({ extensions }),
    ],
  };
}

export default [
  createESMConfig('src/index.js', 'dist/index.js'),
  createCommonJSConfig('src/index.js', 'dist/index.cjs.js'),
  createIIFEConfig('src/index.js', 'dist/index.iife.js', 'easyPeasy'),
];
