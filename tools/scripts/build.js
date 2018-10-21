const { readFileSync } = require('fs')
const { inInstall } = require('in-publish')
const prettyBytes = require('pretty-bytes')
const gzipSize = require('gzip-size')
const { pipe } = require('ramda')
const { exec } = require('../utils')
const packageJson = require('../../package.json')

if (inInstall()) {
  process.exit(0)
}

const nodeEnv = Object.assign({}, process.env, {
  NODE_ENV: 'production',
})

exec('npx rollup -c rollup-min.config.js', nodeEnv)
exec('npx rollup -c rollup.config.js', nodeEnv)

function fileGZipSize(path) {
  return pipe(
    readFileSync,
    gzipSize.sync,
    prettyBytes,
  )(path)
}

console.log(
  `\ngzipped, the build is ${fileGZipSize(`dist/${packageJson.name}.min.js`)}`,
)
