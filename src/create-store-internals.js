import memoizerific from 'memoizerific';
import produce from 'immer';
import {
  actionNameSymbol,
  actionSymbol,
  selectorSymbol,
  selectorConfigSymbol,
  selectorStateSymbol,
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
  isRebind,
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
  let selectorId = 0;
  const selectorsDict = {};

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
        } else if (value[selectorSymbol]) {
          selectorId += 1;
          const selectorInstanceId = selectorId;
          const { args, config } = value[selectorConfigSymbol];
          const stateSelectors =
            args && Array.isArray(args) ? args : [state => state];
          const limit =
            typeof config === 'object' &&
            typeof config.limit === 'number' &&
            config.limit > 0
              ? config.number
              : 1;
          const internalSelector = memoizerific(limit)((...a) =>
            value(
              a.slice(0, stateSelectors.length),
              a.slice(stateSelectors.length),
            ),
          );
          let changeIdx = 0;

          /**
           * This allows us to track whether the state we are depending on
           * (resolved via the state selectors), has changed. If so then we know
           * that we should create a new instance of our selector function so
           * that updates are propagated and memoization caches are cleared.
           */
          const createDependentStateChangeTracker = () => {
            const internalChecker = memoizerific(1)(() => {
              changeIdx += 1;
              return changeIdx;
            });
            const dependentStateChangeTracker = storeState => {
              const localState = get(parentPath, storeState);
              const resolvedStateArgs = stateSelectors.reduce(
                (acc, argSelector) => {
                  acc.push(argSelector(localState, storeState));
                  return acc;
                },
                [],
              );
              return internalChecker(...resolvedStateArgs);
            };
            return dependentStateChangeTracker;
          };

          /**
           * We create a function allowing us to create new selector instances.
           * We will need this ability to reinitialise a selector of the state
           * it depends on changes.
           */
          const createSelector = () => {
            const selector = (...runtimeArgs) => {
              const storeState = references.getState();
              const localState = get(parentPath, storeState);
              const selectedStateArgs = stateSelectors.reduce(
                (acc, argSelector) => [
                  ...acc,
                  argSelector(localState, storeState),
                ],
                [],
              );
              return internalSelector(...selectedStateArgs.concat(runtimeArgs));
            };
            selector[selectorStateSymbol] = {
              dependentStateChangeTracker: createDependentStateChangeTracker(),
              createSelector,
              meta,
              selectorId: selectorInstanceId,
            };
            return selector;
          };
          const selector = createSelector();
          selectorsDict[selectorId] = selector;
          set(path, defaultState, selector);
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
        if (!isRebind && initialParentRef && key in initialParentRef) {
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

    const selectsReducer = state => {
      const stateAfterSelectors = runSelectors(state);
      isInitial = false;
      selectorReducers.forEach(selector => {
        selector[selectStateSymbol].executed = false;
      });
      return stateAfterSelectors;
    };

    const selectorsReducer = state => {
      const selectors = Object.values(selectorsDict);
      return produce(state, draft => {
        selectors.forEach(selector => {
          const selectorState = selector[selectorStateSymbol];
          if (selectorState.prevStateCheckId == null) {
            selectorState.prevStateCheckId = selectorState.dependentStateChangeTracker(
              state,
            );
          } else {
            const nextStateCheckId = selectorState.dependentStateChangeTracker(
              state,
            );
            if (selectorState.prevStateCheckId !== nextStateCheckId) {
              const newSelector = selectorState.createSelector();
              newSelector[selectorState.prevStateCheckId] = nextStateCheckId;
              selectorsDict[selectorState.selectorId] = newSelector;
              set(selectorState.meta.path, draft, newSelector);
            }
          }
        });
      });
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
      const stateAfterSelect =
        state !== stateAfterCustomReducers || isInitial
          ? selectsReducer(stateAfterCustomReducers)
          : stateAfterCustomReducers;
      return selectorsReducer(stateAfterSelect);
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
