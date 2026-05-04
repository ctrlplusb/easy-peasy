import path from 'path';
import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const { root } = path.parse(process.cwd());

const external = (id) => !id.startsWith('.') && !id.startsWith(root);

const extensions = ['.js'];

const useClientBanner = `'use client';`;

function createESMConfig(input, output) {
  return {
    input,
    output: {
      sourcemap: true,
      file: output,
      format: 'esm',
      banner: useClientBanner,
    },
    external,
    plugins: [
      resolve({ extensions }),
      babel({
        extensions,
        babelHelpers: 'bundled',
        sourceMaps: true,
        inputSourceMap: true,
      }),
    ],
  };
}

function createCommonJSConfig(input, output) {
  return {
    input,
    output: {
      sourcemap: true,
      file: output,
      format: 'cjs',
      exports: 'named',
      banner: useClientBanner,
    },
    external,
    plugins: [
      resolve({ extensions }),
      babel({
        extensions,
        babelHelpers: 'bundled',
        sourceMaps: true,
        inputSourceMap: true,
      }),
    ],
  };
}

export default [
  createESMConfig('src/index.js', 'dist/index.js'),
  createCommonJSConfig('src/index.js', 'dist/index.cjs.js'),
];
