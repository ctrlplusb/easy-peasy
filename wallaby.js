const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'test';

const babelConfigContents = fs.readFileSync(path.join(__dirname, '.babelrc'));
const babelConfig = JSON.parse(babelConfigContents);

module.exports = wallaby => ({
  files: [
    'src/**/*.js',
    { pattern: 'src/**/*.test.js', ignore: true },
    { pattern: 'src/__tests__/typescript/**/*', ignore: true },
  ],
  tests: [
    'src/**/*.test.js',
    { pattern: 'src/__tests__/typescript.test.js', ignore: true },
  ],
  testFramework: 'jest',
  env: {
    type: 'node',
    runner: 'node',
  },
  compilers: {
    'src/**/*.js': wallaby.compilers.babel(babelConfig),
  },
});
