import memoizerific from 'memoizerific';
import { createDraft, finishDraft, nothing, isDraft } from 'immer-peasy';
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
  if (result === nothing) {
    return undefined;
  }
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

  const defaultState = initialState || {};

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
          value.type = type;
          value[metaSymbol] = meta;

          // Action Reducer
          const actionReducer = value;
          actionReducer.type = type;
          actionReducersDict[type] = actionReducer;
          actionReducersForPath[parentPath] = actionReducer;

          // Action Creator
          const actionCreator = payload => {
            const result = references.dispatch({
              type: actionReducer.type,
              payload,
            });
            return result;
          };
          actionCreator.type = type;
          actionCreator[actionSymbol] = true;
          actionCreatorDict[type] = actionCreator;
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
          const action = payload => {
            return value(get(parentPath, actionCreators), payload, {
              dispatch: references.dispatch,
              getState: () => get(parentPath, references.getState()),
              getStoreActions: () => actionCreators,
              getStoreState: references.getState,
              injections,
              meta,
            });
          };
          set(path, actionThunks, action);

          const startedType = `${type}(started)`;
          const succeededType = `${type}(succeeded)`;
          const failedType = `${type}(failed)`;

          // Thunk Action Creator
          const actionCreator = payload =>
            tick()
              .then(() =>
                references.dispatch({
                  type: startedType,
                  payload,
                }),
              )
              .then(() => references.dispatch(() => action(payload)))
              .then(result => {
                references.dispatch({
                  type: succeededType,
                  payload,
                });
                references.dispatch({
                  type,
                  payload,
                });
                return result;
              })
              .catch(err => {
                references.dispatch({
                  type: failedType,
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
          actionCreator.startedType = startedType;
          actionCreator.completedType = succeededType;
          actionCreator.failedType = failedType;
          actionCreator[thunkSymbol] = true;
          actionCreatorDict[type] = actionCreator;
          set(path, actionCreators, actionCreator);

          if (value[listenerThunkSymbol]) {
            listenerActionDefinitions.push(value);
          }
        } else if (value[computedSymbol]) {
          let target = get(parentPath, defaultState);
          if (!target) {
            target = {};
            set(parentPath, defaultState, target);
          }
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
              set: () => {
                throw new Error(
                  `Easy Peasy: You attempted to set "${path.join(
                    '.',
                  )}", which is a computed property set a computed property`,
                );
              },
            });
          };
          createComputedProperty(target);
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

  listenerActionDefinitions.forEach(listenerAction => {
    const { targetResolver } =
      listenerAction[actionStateSymbol] || listenerAction[thunkStateSymbol];

    if (typeof targetResolver !== 'function') {
      return;
    }

    const { parent } = listenerAction[metaSymbol];

    const targets = targetResolver(get(parent, actionCreators), actionCreators);

    const processListenTo = target => {
      let targetName;

      if (
        typeof target === 'function' &&
        target.type &&
        actionCreatorDict[target.type]
      ) {
        if (target[thunkSymbol]) {
          targetName = target.completedType;
        } else {
          targetName = target.type;
        }
      } else if (typeof target === 'string') {
        targetName = target;
      }
      const listenerReg = listenerActionMap[targetName] || [];
      listenerReg.push(actionCreatorDict[listenerAction.type]);
      listenerActionMap[targetName] = listenerReg;
    };

    if (Array.isArray(targets)) {
      targets.forEach(processListenTo);
    } else {
      processListenTo(targets);
    }
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
