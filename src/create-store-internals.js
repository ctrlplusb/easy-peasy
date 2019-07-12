import memoizerific from 'memoizerific';
import { createDraft, finishDraft, isDraft } from 'immer-peasy';
import {
  actionStateSymbol,
  actionSymbol,
  computedSymbol,
  computedConfigSymbol,
  listenerActionSymbol,
  listenerThunkSymbol,
  metaSymbol,
  reducerSymbol,
  thunkStateSymbol,
  thunkSymbol,
} from './constants';
import { isStateObject, get, set } from './lib';

function simpleProduce(state, fn) {
  const draft = createDraft(state);
  const result = fn(draft);
  if (result !== undefined) {
    return isDraft(result) ? finishDraft(result) : result;
  }
  return finishDraft(draft);
}

function tick() {
  return new Promise(resolve => setTimeout(resolve));
}

export default function createStoreInternals({
  initialState,
  injections,
  model,
  reducerEnhancer,
  references,
}) {
  let isInReducer = false;

  const defaultState = initialState;

  const actionCreatorDict = {};
  const actionCreators = {};
  const actionReducersDict = {};
  const actionReducersForPath = {};
  const actionThunks = {};
  const computedProperties = [];
  const customReducers = [];
  const listenerActionDefinitions = [];
  const listenerActionMap = {};

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
        if (value[actionSymbol] || value[listenerActionSymbol]) {
          const type = `@action.${path.join('.')}`;
          value.actionName = key;
          value.type = type;
          value[metaSymbol] = meta;

          // Action Reducer
          const actionReducer = value;
          actionReducer.type = type;
          actionReducersDict[type] = actionReducer;
          actionReducersForPath[parentPath] = actionReducer;

          // Action Creator
          const actionCreator = payload => {
            const actionDefinition = {
              type: actionReducer.type,
              payload,
            };
            if (value[listenerActionSymbol] && actionCreator.resolvedTargets) {
              payload.resolvedTargets = [...actionCreator.resolvedTargets];
            }
            const result = references.dispatch(actionDefinition);
            return result;
          };
          actionCreator.actionName = key;
          actionCreator.type = type;
          actionCreator[actionSymbol] = true;
          actionCreatorDict[type] = actionCreator;
          value.actionCreator = actionCreator;
          set(path, actionCreators, actionCreator);

          if (value[listenerActionSymbol]) {
            listenerActionDefinitions.push(value);
          }
        } else if (value[thunkSymbol] || value[listenerThunkSymbol]) {
          const type = `@thunk.${path.join('.')}`;
          value.actionName = key;
          value.type = type;
          value[metaSymbol] = meta;

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
            if (value[listenerThunkSymbol] && thunkHandler.resolvedTargets) {
              payload.resolvedTargets = [...thunkHandler.resolvedTargets];
            }
            return value(get(parentPath, actionCreators), payload, helpers);
          };
          set(path, actionThunks, thunkHandler);

          const startType = `${type}(start)`;
          const successType = `${type}(success)`;
          const failType = `${type}(fail)`;

          // Thunk Action Creator
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

          actionCreator.actionName = key;
          actionCreator.type = type;
          actionCreator.startType = startType;
          actionCreator.successType = successType;
          actionCreator.failType = failType;
          actionCreator[thunkSymbol] = true;
          actionCreatorDict[type] = actionCreator;
          set(path, actionCreators, actionCreator);

          value.thunkHandler = thunkHandler;

          if (value[listenerThunkSymbol]) {
            listenerActionDefinitions.push(value);
          }
        } else if (value[computedSymbol]) {
          const parent = get(parentPath, defaultState);
          const config = value[computedConfigSymbol];
          const { stateResolvers } = config;
          const memoisedResultFn = memoizerific(1)(value);
          let cache;
          const createComputedProperty = o => {
            Object.defineProperty(o, key, {
              configurable: true,
              enumerable: true,
              get: () => {
                const storeState = isInReducer
                  ? references.currentState
                  : references.getState();
                const state = get(parentPath, storeState);
                const inputs = stateResolvers.map(resolver =>
                  resolver(state, storeState),
                );
                cache = memoisedResultFn(...inputs);
                return cache;
              },
            });
          };
          createComputedProperty(parent);
          computedProperties.push({ key, parentPath, createComputedProperty });
        } else if (value[reducerSymbol]) {
          customReducers.push({ path, reducer: value });
        } else {
          handleValueAsState();
        }
      } else if (isStateObject(value) && Object.keys(value).length > 0) {
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

  listenerActionDefinitions.forEach(listenerActionOrThunk => {
    const { targetResolver } =
      listenerActionOrThunk[actionStateSymbol] ||
      listenerActionOrThunk[thunkStateSymbol];

    const { parent } = listenerActionOrThunk[metaSymbol];

    const targets = targetResolver(get(parent, actionCreators), actionCreators);
    const resolvedTargets = (Array.isArray(targets)
      ? targets
      : [targets]
    ).reduce((acc, target) => {
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
    }, []);

    if (listenerActionOrThunk.thunkHandler) {
      listenerActionOrThunk.thunkHandler.resolvedTargets = resolvedTargets;
    } else if (listenerActionOrThunk.actionCreator) {
      listenerActionOrThunk.actionCreator.resolvedTargets = resolvedTargets;
    }

    resolvedTargets.forEach(targetType => {
      const listenerReg = listenerActionMap[targetType] || [];
      listenerReg.push(actionCreatorDict[listenerActionOrThunk.type]);
      listenerActionMap[targetType] = listenerReg;
    });
  });

  const createReducer = () => {
    const runActionReducerAtPath = (state, action, actionReducer, path) => {
      if (path.length === 0) {
        return simpleProduce(state, draft =>
          actionReducer(draft, action.payload),
        );
      }
      const current = get(path, state);
      return simpleProduce(state, draft => {
        set(
          actionReducer[metaSymbol].parent,
          draft,
          simpleProduce(current, _draft =>
            actionReducer(_draft, action.payload),
          ),
        );
      });
    };

    const reducerForActions = (state, action) => {
      const actionReducer = actionReducersDict[action.type];
      if (actionReducer) {
        return runActionReducerAtPath(
          state,
          action,
          actionReducer,
          actionReducer[metaSymbol].parent,
        );
      }
      return state;
    };

    const reducerForCustomReducers = (state, action) => {
      return simpleProduce(state, draft => {
        customReducers.forEach(({ path: p, reducer: red }) => {
          const current = get(p, draft);
          set(p, draft, red(current, action));
        });
      });
    };

    const rootReducer = (state, action) => {
      isInReducer = true;
      const stateAfterActions = reducerForActions(state, action);
      const result = reducerForCustomReducers(stateAfterActions, action);
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
    listenerActionMap,
    reducer: reducerEnhancer(createReducer()),
  };
}
