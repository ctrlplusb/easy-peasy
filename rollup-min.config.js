const { uglify } = require('rollup-plugin-uglify')
const packageJson = require('./package.json')

const baseConfig = require('./rollup.config.js')

baseConfig.plugins.push(uglify())
baseConfig.output.file = `dist/${packageJson.name}.min.js`

module.exports = baseConfig
