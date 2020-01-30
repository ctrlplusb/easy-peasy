import { modelVisitorResults, reducerSymbol } from '../../constants';
import createSimpleProduce from '../../lib/create-simple-produce';

function reducerPlugin(config) {
  let customReducers = [];
  const simpleProduce = createSimpleProduce(config.disableImmer);

  return {
    onBeforeParseModel: () => {
      customReducers = [];
    },
    reducer: (state, action) => {
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
