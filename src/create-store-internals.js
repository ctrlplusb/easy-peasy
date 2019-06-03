import memoizerific from 'memoizerific';
import produce from 'immer';
import {
  actionNameSymbol,
  actionSymbol,
  listenSymbol,
  metaSymbol,
  reducerSymbol,
  selectDependenciesSymbol,
  selectImpSymbol,
  selectStateSymbol,
  selectSymbol,
  thunkSymbol,
} from './constants';
import { isStateObject, get, set } from './lib';
import * as helpers from './helpers';

const maxSelectFnMemoize = 100;
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
  disableInternalSelectFnMemoize,
  initialState,
  injections,
  model,
  reducerEnhancer,
  references,
}) {
  const wrapFnWithMemoize = x =>
    !disableInternalSelectFnMemoize && typeof x === 'function'
      ? memoizerific(maxSelectFnMemoize)(x)
      : x;

  const defaultState = initialState || {};
  const actionThunks = {};
  const actionCreators = {};
  const actionCreatorDict = {};
  const customReducers = [];
  const selectorReducers = [];
  const listenDefinitions = [];
  const thunkListenersDict = {};
  const actionListenersDict = {};
  const actionReducersDict = {};
  const actionReducersForPath = {};

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
        } else if (value[thunkSymbol]) {
          const name = `@thunk.${path.join('.')}`;
          value[actionNameSymbol] = name;

          // Thunk Action
          const action = payload => {
            return value(get(parentPath, actionCreators), payload, {
              dispatch: references.dispatch,
              getState: () => get(parentPath, references.getState()),
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
        } else if (value[selectSymbol]) {
          value[selectStateSymbol] = { parentPath, key, executed: false };
          selectorReducers.push(value);
        } else if (value[reducerSymbol]) {
          customReducers.push({ path, reducer: value });
        } else if (value[listenSymbol]) {
          listenDefinitions.push(value);
          value[metaSymbol] = meta;
        } else if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn(
            `Easy Peasy: Found a function at path ${path.join(
              '.',
            )} in your model. Version 2 required that you wrap your action functions with the "action" helper`,
          );
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

  selectorReducers.forEach(selector => {
    selector[selectImpSymbol] = state => wrapFnWithMemoize(selector(state));
  });

  listenDefinitions.forEach(def => {
    def.listeners = def.listeners || {};

    const on = (target, handler) => {
      if (typeof handler !== 'function') {
        return;
      }

      const meta = def[metaSymbol];
      handler[metaSymbol] = meta;

      if (!handler[actionSymbol] && !handler[thunkSymbol]) {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line
          console.warn(
            `Easy Peasy: you must provide either an "action" or "thunk" to your listeners. Found an invalid handler at "${meta.path.join(
              '.',
            )}"`,
          );
        }
        return;
      }

      let targetActionName;

      if (
        typeof target === 'function' &&
        target[actionNameSymbol] &&
        actionCreatorDict[target[actionNameSymbol]]
      ) {
        if (target[thunkSymbol]) {
          targetActionName = helpers.thunkCompleteName(target);
        } else {
          targetActionName = target[actionNameSymbol];
        }
      } else if (typeof target === 'string') {
        targetActionName = target;
      }

      if (targetActionName) {
        if (handler[thunkSymbol]) {
          thunkListenersDict[targetActionName] =
            thunkListenersDict[targetActionName] || [];
          thunkListenersDict[targetActionName].push(handler);
        } else {
          actionListenersDict[targetActionName] =
            actionListenersDict[targetActionName] || [];
          actionListenersDict[targetActionName].push({
            path: meta.parent,
            handler,
          });
        }
        def.listeners[targetActionName] = def.listeners[targetActionName] || [];
        def.listeners[targetActionName].push(handler);
      }
    };
    def(on);
  });

  const runSelectorReducer = (state, selector) => {
    const { parentPath, key, executed } = selector[selectStateSymbol];
    if (executed) {
      return state;
    }
    const dependencies = selector[selectDependenciesSymbol];

    const stateAfterDependencies = dependencies
      ? dependencies.reduce(runSelectorReducer, state)
      : state;

    let newState = stateAfterDependencies;

    if (parentPath.length > 0) {
      const target = get(parentPath, stateAfterDependencies);
      if (target) {
        if (
          !selector.prevState ||
          selector.prevState !== get(parentPath, state)
        ) {
          const newValue = selector[selectImpSymbol](target);
          newState = produce(state, draft => {
            const updateTarget = get(parentPath, draft);
            updateTarget[key] = newValue;
          });
          selector.prevState = get(parentPath, newState);
        }
      }
    } else if (!selector.prevState || selector.prevState !== state) {
      const newValue = selector[selectImpSymbol](stateAfterDependencies);
      newState = produce(state, draft => {
        draft[key] = newValue;
      });
      selector.prevState = newState;
    }

    selector[selectStateSymbol].executed = true;
    return newState;
  };

  const runSelectors = state =>
    selectorReducers.reduce(runSelectorReducer, state);

  const createReducer = () => {
    const runActionReducerAtPath = (state, action, actionReducer, path) => {
      const current = get(path, state);
      if (path.length === 0) {
        return produce(state, _draft => actionReducer(_draft, action.payload));
      }
      return produce(state, draft => {
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

    const reducerForListeners = (state, action) => {
      const target =
        action.type === '@@EP/LISTENER' ? action.actionName : action.type;
      const actionListeners = actionListenersDict[target];
      if (actionListeners) {
        const targetAction =
          action.type === '@@EP/LISTENER'
            ? { type: target, payload: action.payload }
            : action;
        return actionListeners.reduce(
          (newState, { path, handler }) =>
            runActionReducerAtPath(newState, targetAction, handler, path),
          state,
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

    let isInitial = true;

    const selectorsReducer = state => {
      const stateAfterSelectors = runSelectors(state);
      isInitial = false;
      selectorReducers.forEach(selector => {
        selector[selectStateSymbol].executed = false;
      });
      return stateAfterSelectors;
    };

    const rootReducer = (state, action) => {
      const stateAfterActions = reducerForActions(state, action);
      const stateAfterListeners = reducerForListeners(
        stateAfterActions,
        action,
      );
      const stateAfterCustomReducers = reducerForCustomReducers(
        stateAfterListeners,
        action,
      );
      if (state !== stateAfterCustomReducers || isInitial) {
        return selectorsReducer(stateAfterCustomReducers);
      }
      return stateAfterCustomReducers;
    };

    return rootReducer;
  };

  return {
    actionCreators,
    actionListenersDict,
    defaultState,
    listenDefinitions,
    reducer: reducerEnhancer(createReducer()),
    thunkListenersDict,
  };
}
