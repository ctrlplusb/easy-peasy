const registeredPlugins = {};

function registerPlugin(plugin) {
  registeredPlugins[plugin.pluginName] = plugin;
}

export function getPlugins() {
  return Object.values(registeredPlugins);
}

export function registerPlugins(pluginModules) {
  pluginModules.forEach(pluginModule => {
    if (Array.isArray(pluginModule)) {
      pluginModule.forEach(registerPlugin);
    } else {
      registerPlugin(pluginModule);
    }
  });
}
