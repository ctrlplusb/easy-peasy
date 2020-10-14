import { createSimpleProduce, get } from './lib';

export default function createReducer(
  disableImmer,
  _actionReducersDict,
  _customReducers,
  _computedProperties,
) {
  const simpleProduce = createSimpleProduce(disableImmer);

  const runActionReducerAtPath = (state, action, actionReducer, path) => {
    return simpleProduce(path, state, (draft) =>
      actionReducer(draft, action.payload),
    );
  };

  const reducerForActions = (state, action) => {
    const actionReducer = _actionReducersDict[action.type];
    if (actionReducer) {
      return runActionReducerAtPath(
        state,
        action,
        actionReducer,
        actionReducer.definition.meta.parent,
      );
    }
    return state;
  };

  const reducerForCustomReducers = (state, action) => {
    return _customReducers.reduce((acc, { parentPath, key, reducer: red }) => {
      return simpleProduce(parentPath, acc, (draft) => {
        draft[key] = red(draft[key], action);
        return draft;
      });
    }, state);
  };

  const rootReducer = (state, action) => {
    const stateAfterActions = reducerForActions(state, action);
    const next =
      _customReducers.length > 0
        ? reducerForCustomReducers(stateAfterActions, action)
        : stateAfterActions;
    if (state !== next) {
      _computedProperties.forEach(({ parentPath, bindComputedProperty }) => {
        const parentState = get(parentPath, next);
        if (parentState != null) bindComputedProperty(parentState, next);
      });
    }
    return next;
  };

  return rootReducer;
}
