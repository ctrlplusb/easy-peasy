const { spawnSync } = require('child_process');
const path = require('path');

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

  console.log(String(result.stdout));
} catch (err) {
  console.error(
    'easy-peasy failed to patch immer. Without being able to do so you will not be able to use computed properties. Please open an issue to report this.',
  );
  console.log(err.stack);
}
