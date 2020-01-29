import { createSimpleProduce } from './lib';
import { actionSymbol, actionOnSymbol } from './constants';

export default function createReducer(
  disableImmer,
  actionReducersDict,
  references,
) {
  const simpleProduce = createSimpleProduce(disableImmer);

  const runActionReducerAtPath = (state, action, actionReducer, path) => {
    return simpleProduce(path, state, draft =>
      actionReducer(draft, action.payload),
    );
  };

  const reducerForActions = (state, action) => {
    const actionReducer = actionReducersDict[action.type];
    if (actionReducer) {
      const actionMeta =
        actionReducer[actionSymbol] || actionReducer[actionOnSymbol];
      return runActionReducerAtPath(
        state,
        action,
        actionReducer,
        actionMeta.parent,
      );
    }
    return state;
  };

  const reducersForPlugins = (state, action) => {
    return references.plugins.reduce((prevState, plugin) => {
      if (plugin.reducer != null) {
        return plugin.reducer(prevState, action, { simpleProduce });
      }
      return prevState;
    }, state);
  };

  const rootReducer = (state, action) => {
    const stateAfterActions = reducerForActions(state, action);
    const next = reducersForPlugins(stateAfterActions, action);
    if (state !== next) {
      references.plugins.forEach(plugin => {
        if (plugin.onReducerStateChanged != null) {
          plugin.onReducerStateChanged(state, next);
        }
      });
    }
    return next;
  };

  return rootReducer;
}
