import { actionOnSymbol, thunkOnSymbol } from '../../constants';
import get from '../../lib/get';

function listenerPlugin(config, references) {
  const state = {
    listenerActionCreators: {},
    listenerActionMap: {},
    listenerDefinitions: [],
  };
  references.pluginsState.listener = state;

  function createListenerMiddleware() {
    return () => next => action => {
      const result = next(action);
      if (
        action &&
        state.listenerActionMap[action.type] &&
        state.listenerActionMap[action.type].length > 0
      ) {
        const sourceAction =
          references.internals.actionCreatorDict[action.type];
        state.listenerActionMap[action.type].forEach(actionCreator => {
          actionCreator({
            type: sourceAction ? sourceAction.type : action.type,
            payload: action.payload,
            error: action.error,
            result: action.result,
          });
        });
      }
      return result;
    };
  }

  function bindListenerDefinitions() {
    state.listenerDefinitions.forEach(listenerActionOrThunk => {
      const listenerMeta =
        listenerActionOrThunk[actionOnSymbol] ||
        listenerActionOrThunk[thunkOnSymbol];

      const targets = listenerMeta.targetResolver(
        get(listenerMeta.parent, references.internals.actionCreators),
        references.internals.actionCreators,
      );

      const targetTypes = (Array.isArray(targets) ? targets : [targets]).reduce(
        (acc, target) => {
          if (
            typeof target === 'function' &&
            target.type &&
            references.internals.actionCreatorDict[target.type]
          ) {
            acc.push(target.type);
          } else if (typeof target === 'string') {
            acc.push(target);
          }
          return acc;
        },
        [],
      );

      listenerMeta.resolvedTargets = targetTypes;

      targetTypes.forEach(targetType => {
        const listenerReg = state.listenerActionMap[targetType] || [];
        listenerReg.push(
          references.internals.actionCreatorDict[listenerMeta.type],
        );
        state.listenerActionMap[targetType] = listenerReg;
      });
    });
  }

  return {
    middleware: [createListenerMiddleware(references)],
    onBeforeParseModel: () => {
      state.listenerActionCreators = {};
      state.listenerActionMap = {};
      state.listenerDefinitions = [];
    },
    onStoreCreated: () => {
      bindListenerDefinitions();
    },
    storeEnhancer: store =>
      Object.assign(store, {
        getListeners: () =>
          references.pluginsState.listener.listenerActionCreators,
      }),
  };
}

listenerPlugin.pluginName = 'listener';

export default listenerPlugin;
