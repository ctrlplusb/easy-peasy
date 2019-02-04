/* eslint-disable no-param-reassign */

const { uglify } = require('rollup-plugin-uglify')
const babel = require('rollup-plugin-babel')
const changeCase = require('change-case')
const produce = require('immer').default
const replace = require('rollup-plugin-replace')
const fileSize = require('rollup-plugin-filesize')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')

const packageJson = require('./package.json')

process.env.BABEL_ENV = 'production'

const baseConfig = {
  external: [
    'immer',
    'memoizerific',
    'react',
    'redux',
    'redux-thunk',
    'shallowequal',
  ],
  input: 'src/index.js',
  output: {
    sourcemap: true,
  },
  plugins: [
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', { modules: false }],
        '@babel/preset-react',
      ],
      plugins: [
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-syntax-import-meta',
        ['@babel/plugin-proposal-class-properties', { loose: false }],
        '@babel/plugin-proposal-json-strings',
        ['transform-react-remove-prop-types', { removeImport: true }],
      ],
    }),
  ],
}

const commonUMD = config =>
  produce(config, draft => {
    draft.external.splice(draft.external.indexOf('shallowequal'), 1)
    draft.output.format = 'umd'
    draft.output.globals = {
      memoizerific: 'memoizerific',
      'redux-thunk': 'ReduxThunk',
      immer: 'immer',
      react: 'React',
      redux: 'Redux',
    }
    draft.output.name = changeCase
      .titleCase(packageJson.name.replace(/-/g, ' '))
      .replace(/ /g, '')
    draft.plugins.push(fileSize(), resolve(), commonjs())
  })

module.exports = [
  // Universal module definition (UMD) build, unminified, development
  produce(commonUMD(baseConfig), draft => {
    draft.output.file = `dist/${packageJson.name}.js`
    draft.plugins = [
      replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
      ...draft.plugins,
    ]
  }),
  // Universal module definition (UMD) build, minified, production
  produce(commonUMD(baseConfig), draft => {
    draft.output.file = `dist/${packageJson.name}.min.js`
    draft.plugins = [
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      ...draft.plugins,
      uglify(),
    ]
  }),
  // ESM build
  produce(baseConfig, draft => {
    draft.output.format = 'esm'
    draft.output.file = `dist/${packageJson.name}.esm.js`
  }),
  // CJS build
  produce(baseConfig, draft => {
    draft.output.format = 'cjs'
    draft.output.file = `dist/${packageJson.name}.cjs.js`
  }),
]
