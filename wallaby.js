const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'test';

const babelConfigContents = fs.readFileSync(path.join(__dirname, '.babelrc'));
const babelConfig = JSON.parse(babelConfigContents);

module.exports = (wallaby) => ({
  files: [
    'tests/lib/*.js',
    'tests/utils.js',
    'src/**/*.js',
    { pattern: 'tests/**/*.test.js', ignore: true },
    { pattern: 'tests/typescript/**/*', ignore: true },
  ],
  tests: [
    'tests/*.test.js',
    'tests/**/*.test.js',
    { pattern: 'tests/typescript.test.js', ignore: true },
  ],
  testFramework: 'jest',
  env: {
    type: 'node',
    runner: 'node',
  },
  compilers: {
    'src/**/*.js': wallaby.compilers.babel(babelConfig),
    'tests/**/*.js': wallaby.compilers.babel(babelConfig),
  },
});
