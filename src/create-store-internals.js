import memoizerific from 'memoizerific';
import { createDraft, finishDraft, isDraft } from 'immer-peasy';
import {
  actionOnSymbol,
  actionSymbol,
  computedSymbol,
  reducerSymbol,
  thunkOnSymbol,
  thunkSymbol,
} from './constants';
import { isStateObject, get, set } from './lib';

function tick() {
  return new Promise(resolve => setTimeout(resolve));
}

const newify = (currentPath, currentState, finalValue) => {
  if (currentPath.length === 0) {
    return finalValue;
  }
  const newState = { ...currentState };
  const key = currentPath[0];
  if (currentPath.length === 1) {
    newState[key] = finalValue;
  } else {
    newState[key] = newify(currentPath.slice(1), newState[key], finalValue);
  }
  return newState;
};

export default function createStoreInternals({
  disableImmer,
  initialState,
  injections,
  model,
  reducerEnhancer,
  references,
}) {
  function simpleProduce(path, state, fn) {
    if (disableImmer) {
      const current = get(path, state);
      const next = fn(current);
      if (current !== next) {
        return newify(path, state, next);
      }
      return state;
    }
    const draft = createDraft(state);
    const current = get(path, draft);
    fn(current);
    return finishDraft(draft);
  }

  let isInReducer = false;
  const defaultState = initialState;
  const actionCreatorDict = {};
  const actionCreators = {};
  const actionReducersDict = {};
  const actionThunks = {};
  const computedProperties = [];
  const customReducers = [];
  const listenerActionCreators = {};
  const listenerActionMap = {};
  const listenerDefinitions = [];

  const recursiveExtractDefsFromModel = (current, parentPath) =>
    Object.keys(current).forEach(key => {
      const value = current[key];
      const path = [...parentPath, key];
      const meta = {
        parent: parentPath,
        path,
      };
      const handleValueAsState = () => {
        const initialParentRef = get(parentPath, initialState);
        if (initialParentRef && key in initialParentRef) {
          set(path, defaultState, initialParentRef[key]);
        } else {
          set(path, defaultState, value);
        }
      };
      if (typeof value === 'function') {
        if (value[actionSymbol] || value[actionOnSymbol]) {
          const prefix = value[actionSymbol] ? '@action' : '@actionOn';
          const type = `${prefix}.${path.join('.')}`;
          const actionMeta = value[actionSymbol] || value[actionOnSymbol];
          actionMeta.actionName = key;
          actionMeta.type = type;
          actionMeta.parent = meta.parent;
          actionMeta.path = meta.path;

          // Action Reducer
          actionReducersDict[type] = value;

          // Action Creator
          const actionCreator = payload => {
            const actionDefinition = {
              type,
              payload,
            };
            if (value[actionOnSymbol] && actionMeta.resolvedTargets) {
              payload.resolvedTargets = [...actionMeta.resolvedTargets];
            }
            const result = references.dispatch(actionDefinition);
            return result;
          };
          actionCreator.type = type;

          actionCreatorDict[type] = actionCreator;
          if (key !== 'easyPeasyReplaceState') {
            if (value[actionOnSymbol]) {
              listenerDefinitions.push(value);
              set(path, listenerActionCreators, actionCreator);
            } else {
              set(path, actionCreators, actionCreator);
            }
          }
        } else if (value[thunkSymbol] || value[thunkOnSymbol]) {
          const prefix = value[thunkSymbol] ? '@thunk' : '@thunkOn';
          const type = `${prefix}.${path.join('.')}`;
          const thunkMeta = value[thunkSymbol] || value[thunkOnSymbol];
          thunkMeta.actionName = key;
          thunkMeta.type = type;
          thunkMeta.parent = meta.parent;
          thunkMeta.path = meta.path;

          // Thunk Action
          const thunkHandler = payload => {
            const helpers = {
              dispatch: references.dispatch,
              getState: () => get(parentPath, references.getState()),
              getStoreActions: () => actionCreators,
              getStoreState: references.getState,
              injections,
              meta,
            };
            if (value[thunkOnSymbol] && thunkMeta.resolvedTargets) {
              payload.resolvedTargets = [...thunkMeta.resolvedTargets];
            }
            return value(get(parentPath, actionCreators), payload, helpers);
          };
          set(path, actionThunks, thunkHandler);

          // Thunk Action Creator
          const startType = `${type}(start)`;
          const successType = `${type}(success)`;
          const failType = `${type}(fail)`;
          const actionCreator = payload =>
            tick()
              .then(() =>
                references.dispatch({
                  type: startType,
                  payload,
                }),
              )
              .then(() => references.dispatch(() => thunkHandler(payload)))
              .then(result => {
                references.dispatch({
                  type: successType,
                  payload,
                  result,
                });
                references.dispatch({
                  type,
                  payload,
                  result,
                });
                return result;
              })
              .catch(err => {
                references.dispatch({
                  type: failType,
                  payload,
                  error: err,
                });
                references.dispatch({
                  type,
                  payload,
                  error: err,
                });
                throw err;
              });
          actionCreator.type = type;
          actionCreator.startType = startType;
          actionCreator.successType = successType;
          actionCreator.failType = failType;

          actionCreatorDict[type] = actionCreator;

          if (value[thunkOnSymbol]) {
            listenerDefinitions.push(value);
            set(path, listenerActionCreators, actionCreator);
          } else {
            set(path, actionCreators, actionCreator);
          }
        } else if (value[computedSymbol]) {
          const parent = get(parentPath, defaultState);
          const computedMeta = value[computedSymbol];
          const memoisedResultFn = memoizerific(1)(value);
          const createComputedProperty = o => {
            Object.defineProperty(o, key, {
              configurable: true,
              enumerable: true,
              get: () => {
                const storeState = isInReducer
                  ? references.currentState
                  : references.getState();
                const state = get(parentPath, storeState);
                const inputs = computedMeta.stateResolvers.map(resolver =>
                  resolver(state, storeState),
                );
                return memoisedResultFn(...inputs);
              },
            });
          };
          createComputedProperty(parent);
          computedProperties.push({ key, parentPath, createComputedProperty });
        } else if (value[reducerSymbol]) {
          customReducers.push({ key, parentPath, reducer: value });
        } else {
          handleValueAsState();
        }
      } else if (isStateObject(value)) {
        const existing = get(path, defaultState);
        if (existing == null) {
          set(path, defaultState, {});
        }
        recursiveExtractDefsFromModel(value, path);
      } else {
        handleValueAsState();
      }
    });

  recursiveExtractDefsFromModel(model, []);

  listenerDefinitions.forEach(listenerActionOrThunk => {
    const listenerMeta =
      listenerActionOrThunk[actionOnSymbol] ||
      listenerActionOrThunk[thunkOnSymbol];

    const targets = listenerMeta.targetResolver(
      get(listenerMeta.parent, actionCreators),
      actionCreators,
    );
    const targetTypes = (Array.isArray(targets) ? targets : [targets]).reduce(
      (acc, target) => {
        if (
          typeof target === 'function' &&
          target.type &&
          actionCreatorDict[target.type]
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
      const listenerReg = listenerActionMap[targetType] || [];
      listenerReg.push(actionCreatorDict[listenerMeta.type]);
      listenerActionMap[targetType] = listenerReg;
    });
  });

  const createReducer = () => {
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
      isInReducer = true;
      const stateAfterActions = reducerForActions(state, action);
      const result =
        customReducers.length > 0
          ? reducerForCustomReducers(stateAfterActions, action)
          : stateAfterActions;
      isInReducer = false;
      if (result !== state) {
        computedProperties.forEach(({ parentPath, createComputedProperty }) => {
          createComputedProperty(get(parentPath, result));
        });
      }
      return result;
    };

    return rootReducer;
  };

  return {
    actionCreatorDict,
    actionCreators,
    defaultState,
    listenerActionCreators,
    listenerActionMap,
    reducer: reducerEnhancer(createReducer()),
  };
}
