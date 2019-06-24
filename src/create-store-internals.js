import memoizerific from 'memoizerific';
import produce from 'immer-peasy';
import {
  actionNameSymbol,
  actionStateSymbol,
  actionSymbol,
  computedSymbol,
  computedConfigSymbol,
  metaSymbol,
  reducerSymbol,
  thunkStateSymbol,
  thunkSymbol,
} from './constants';
import { isStateObject, get, set } from './lib';
import * as helpers from './helpers';

const tick = () => new Promise(resolve => setTimeout(resolve));

const errorToPayload = err => {
  if (err instanceof Error) {
    return {
      message: err.message,
      stack: err.stack,
    };
  }
  if (typeof err === 'string') {
    return err;
  }
  return undefined;
};

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
      if (typeof value === 'function') {
        if (value[actionSymbol]) {
          const name = `@action.${path.join('.')}`;
          value[actionNameSymbol] = name;
          value[metaSymbol] = meta;

          // Action Reducer
          const actionReducer = value;
          actionReducer[actionNameSymbol] = name;
          actionReducersDict[name] = actionReducer;
          actionReducersForPath[parentPath] = actionReducer;

          // Action Creator
          const actionCreator = payload => {
            const result = references.dispatch({
              type: actionReducer[actionNameSymbol],
              payload,
            });
            return result;
          };
          actionCreator[actionNameSymbol] = name;
          actionCreatorDict[name] = actionCreator;
          set(path, actionCreators, actionCreator);

          const { config } = value[actionStateSymbol];
          if (config && config.listenTo) {
            listenerActionDefinitions.push(value);
          }
        } else if (value[thunkSymbol]) {
          const name = `@thunk.${path.join('.')}`;
          value[actionNameSymbol] = name;

          // Thunk Action
          const action = payload => {
            return value(get(parentPath, actionCreators), payload, {
              // @deprecated
              dispatch: references.dispatch,
              getState: () => get(parentPath, references.getState()),
              getStoreActions: () => actionCreators,
              getStoreState: references.getState,
              injections,
              meta,
            });
          };
          set(path, actionThunks, action);

          // Thunk Action Creator
          const actionCreator = payload =>
            tick()
              .then(() =>
                references.dispatch({
                  type: `${name}(started)`,
                  payload,
                }),
              )
              .then(() => references.dispatch(() => action(payload)))
              .then(result => {
                references.dispatch({
                  type: `${name}(completed)`,
                  payload,
                });
                return result;
              })
              .catch(err => {
                references.dispatch({
                  type: `${name}(failed)`,
                  payload,
                  error: errorToPayload(err),
                });
                throw err;
              });

          actionCreator[actionNameSymbol] = name;
          actionCreatorDict[name] = actionCreator;
          set(path, actionCreators, actionCreator);

          const { config } = value[thunkStateSymbol];
          if (config && config.listenTo) {
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
        }
      } else if (isStateObject(value) && Object.keys(value).length > 0) {
        const existing = get(path, defaultState);
        if (existing == null) {
          set(path, defaultState, {});
        }
        recursiveExtractDefsFromModel(value, path);
      } else {
        // State
        const initialParentRef = get(parentPath, initialState);
        if (initialParentRef && key in initialParentRef) {
          set(path, defaultState, initialParentRef[key]);
        } else {
          set(path, defaultState, value);
        }
      }
    });

  recursiveExtractDefsFromModel(model, []);

  listenerActionDefinitions.forEach(listenerAction => {
    const {
      config: { listenTo },
    } = listenerAction[actionStateSymbol] || listenerAction[thunkStateSymbol];
    let targetName;

    const processListenTo = target => {
      if (
        typeof target === 'function' &&
        target[actionNameSymbol] &&
        actionCreatorDict[target[actionNameSymbol]]
      ) {
        if (target[thunkSymbol]) {
          targetName = helpers.thunkCompleteName(target);
        } else {
          targetName = target[actionNameSymbol];
        }
      } else if (typeof target === 'string') {
        targetName = target;
      }
      const listenerReg = listenerActionMap[targetName] || [];
      listenerReg.push(actionCreatorDict[listenerAction[actionNameSymbol]]);
      listenerActionMap[targetName] = listenerReg;
    };

    if (Array.isArray(listenTo)) {
      listenTo.forEach(processListenTo);
    } else {
      processListenTo(listenTo);
    }
  });

  const createReducer = () => {
    const runActionReducerAtPath = (state, action, actionReducer, path) => {
      const current = get(path, state);
      return path.length === 0
        ? produce(state, _draft => actionReducer(_draft, action.payload))
        : produce(state, draft => {
            set(
              actionReducer[metaSymbol].parent,
              draft,
              produce(current, _draft => actionReducer(_draft, action.payload)),
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
      return produce(state, draft => {
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
    actionCreators,
    defaultState,
    listenerActionMap,
    reducer: reducerEnhancer(createReducer()),
  };
}
