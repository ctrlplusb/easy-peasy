'use strict';

function persistPlugin() {
  return {
    middleware: [],
    storeEnhancer: function storeEnhancer(store) {
      return store;
    },
    modelExtractor: function modelExtractor(current, meta, next) {
      next();
    }
  };
}
persistPlugin.name = 'persist';

module.exports = persistPlugin;
//# sourceMappingURL=persist.js.map
