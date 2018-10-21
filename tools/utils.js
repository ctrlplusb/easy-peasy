const { execSync } = require('child_process')
const appRootDir = require('app-root-dir')

function exec(command) {
  execSync(command, { stdio: 'inherit', cwd: appRootDir.get() })
}

module.exports = {
  exec,
}
