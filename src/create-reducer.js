import { isDraft, original } from 'immer';
import { createSimpleProduce, get } from './lib';

export default function createReducer(disableImmer, _aRD, _cR, _cP) {
  const simpleProduce = createSimpleProduce(disableImmer);

  const runActionReducerAtPath = (state, action, actionReducer, path) =>
    simpleProduce(path, state, (draft) => actionReducer(draft, action.payload));

  const reducerForActions = (state, action) => {
    const actionReducer = _aRD[action.type];
    if (actionReducer) {
      return runActionReducerAtPath(
        state,
        action,
        actionReducer,
        actionReducer.def.meta.parent,
      );
    }
    return state;
  };

  const reducerForCustomReducers = (state, action) =>
    _cR.reduce(
      (acc, { parentPath, key, reducer }) =>
        simpleProduce(parentPath, acc, (draft) => {
          draft[key] = reducer(
            isDraft(draft[key]) ? original(draft[key]) : draft[key],
            action,
          );
          return draft;
        }),
      state,
    );

  const rootReducer = (state, action) => {
    const stateAfterActions = reducerForActions(state, action);
    const next =
      _cR.length > 0
        ? reducerForCustomReducers(stateAfterActions, action)
        : stateAfterActions;
    if (state !== next) {
      _cP.forEach(({ parentPath, bindComputedProperty }) => {
        const parentState = get(parentPath, next);
        if (parentState != null) bindComputedProperty(parentState, next);
      });
    }
    return next;
  };

  return rootReducer;
}
