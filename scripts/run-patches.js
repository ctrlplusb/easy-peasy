const { spawnSync } = require('child_process');
const path = require('path');

const printError = () =>
  console.error(
    'easy-peasy failed to patch immer. Without being able to do so you will not be able to use computed properties. Please open an issue to report this.',
  );

try {
  const immerRoot = path.dirname(require.resolve('patch-package/package.json'));

  const patchesDir = path.resolve(__dirname, '../patches');

  const parentNodeModules = path.resolve(immerRoot, '../../');

  const patchPackageRoot = path.dirname(
    require.resolve('patch-package/package.json'),
  );

  const result = spawnSync(
    `node`,
    [
      `${patchPackageRoot}/index.js`,
      '--patch-dir',
      path.relative(parentNodeModules, patchesDir),
    ],
    {
      cwd: parentNodeModules,
    },
  );

  const resultString = String(result.stdout).trim();

  if (resultString.length > 0) {
    console.log(resultString);
  } else {
    printError();
  }
} catch (err) {
  printError();
  console.log(err.stack);
}
