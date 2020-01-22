export const registeredPlugins = [];

function registerPlugin(plugin) {
  if (!registeredPlugins.find(x => x.name === plugin.name)) {
    registeredPlugins.push(plugin);
  }
}

export function registerPlugins(plugins) {
  plugins.forEach(registerPlugin);
}
