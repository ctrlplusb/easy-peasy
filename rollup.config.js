import path from 'path';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import analyze from 'rollup-plugin-analyzer';
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
      analyze({ summaryOnly: true }),
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
      analyze({ summaryOnly: true }),
    ],
  };
}

export default [
  createESMConfig('src/index.js', 'dist/index.js'),
  createCommonJSConfig('src/index.js', 'dist/index.cjs.js'),
];
