import { modelVisitorResults, reducerSymbol } from '../../constants';

function reducerPlugin() {
  let customReducers = [];

  return {
    onBeforeCreateStore: () => {
      customReducers = [];
    },
    reducer: (state, action, internals) => {
      const { simpleProduce } = internals;
      return customReducers.reduce((acc, { parentPath, key, reducer: red }) => {
        return simpleProduce(parentPath, acc, draft => {
          draft[key] = red(draft[key], action);
          return draft;
        });
      }, state);
    },
    modelVisitor: (value, key, meta) => {
      if (typeof value === 'function' && value[reducerSymbol]) {
        const { parentPath } = meta;
        customReducers.push({ key, parentPath, reducer: value });
        return modelVisitorResults.CONTINUE;
      }
      return undefined;
    },
  };
}

reducerPlugin.pluginName = 'reducer';

export default reducerPlugin;
