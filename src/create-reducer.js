import { createSimpleProduce, get } from './lib';
import { actionSymbol, actionOnSymbol } from './constants';

export default function createReducer(
  disableImmer,
  actionReducersDict,
  customReducers,
  computedProperties,
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

  const reducerForCustomReducers = (state, action) => {
    return customReducers.reduce((acc, { parentPath, key, reducer: red }) => {
      return simpleProduce(parentPath, acc, draft => {
        draft[key] = red(draft[key], action);
        return draft;
      });
    }, state);
  };

  const rootReducer = (state, action) => {
    const stateAfterActions = reducerForActions(state, action);
    const next =
      customReducers.length > 0
        ? reducerForCustomReducers(stateAfterActions, action)
        : stateAfterActions;
    if (state !== next) {
      computedProperties.forEach(({ parentPath, bindComputedProperty }) => {
        bindComputedProperty(get(parentPath, next));
      });
    }
    return next;
  };

  return rootReducer;
}
