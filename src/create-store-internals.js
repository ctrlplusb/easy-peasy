import memoizerific from 'memoizerific';
import { createDraft, finishDraft, isDraft } from 'immer-peasy';
import isPlainObject from 'is-plain-object';
import {
  actionOnSymbol,
  actionSymbol,
  computedSymbol,
  persistSymbol,
  reducerSymbol,
  thunkOnSymbol,
  thunkSymbol,
} from './constants';
import { get, set, newify } from './lib';
import { createStorageWrapper } from './storage';

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
    if (path.length === 0) {
      const draft = createDraft(state);
      const result = fn(draft);
      if (result) {
        return isDraft(result) ? finishDraft(result) : result;
      }
      return finishDraft(draft);
    }
    const parentPath = path.slice(0, path.length - 1);
    const draft = createDraft(state);
    const parent = get(parentPath, state);
    const current = get(path, draft);
    const result = fn(current);

    if (result) {
      parent[path[path.length - 1]] = result;
    }
    return finishDraft(draft);
  }

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
  const persistenceConfig = [];

  const computedState = {
    isInReducer: false,
    currentState: defaultState,
  };

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

      if (key === persistSymbol) {
        const config = value || {};
        persistenceConfig.push({
          path: parentPath,
          config: {
            blacklist: config.blacklist || [],
            mergeStrategy: config.mergeStrategy || 'merge',
            storage: createStorageWrapper(config.storage, config.transformers),
            whitelist: config.whitelist || [],
          },
        });
        return;
      }

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
          const actionCreator = payload => {
            const dispatchError = err => {
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
            };
            const dispatchSuccess = result => {
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
            };

            references.dispatch({
              type: startType,
              payload,
            });
            try {
              const result = references.dispatch(() => thunkHandler(payload));
              if (
                typeof result === 'object' &&
                typeof result.then === 'function'
              ) {
                return result
                  .then(resolved => {
                    dispatchSuccess(resolved);
                    return resolved;
                  })
                  .catch(err => {
                    dispatchError(err);
                    throw err;
                  });
              }
              dispatchSuccess(result);
              return result;
            } catch (err) {
              dispatchError(err);
              throw err;
            }
          };

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
                let storeState;
                if (computedState.isInReducer) {
                  storeState = computedState.currentState;
                } else if (references.getState == null) {
                  return undefined;
                } else {
                  try {
                    storeState = references.getState();
                  } catch (err) {
                    if (process.env.NODE_ENV !== 'production') {
                      console.warn(
                        'Invalid access attempt to a computed property',
                      );
                    }
                    return undefined;
                  }
                }
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
      } else if (isPlainObject(value)) {
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
      const stateAfterActions = reducerForActions(state, action);
      const next =
        customReducers.length > 0
          ? reducerForCustomReducers(stateAfterActions, action)
          : stateAfterActions;
      if (state !== next) {
        computedProperties.forEach(({ parentPath, createComputedProperty }) => {
          createComputedProperty(get(parentPath, next));
        });
      }
      return next;
    };

    return rootReducer;
  };

  return {
    actionCreatorDict,
    actionCreators,
    computedProperties,
    computedState,
    defaultState,
    listenerActionCreators,
    listenerActionMap,
    persistenceConfig,
    reducer: reducerEnhancer(createReducer()),
  };
}
