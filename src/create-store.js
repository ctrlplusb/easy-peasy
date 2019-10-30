import {
  applyMiddleware,
  compose as reduxCompose,
  createStore as reduxCreateStore,
} from 'redux';
import reduxThunk from 'redux-thunk';
import debounce from 'debounce';
import * as helpers from './helpers';
import createStoreInternals from './create-store-internals';
import { get, set, isPromise, deepCloneObjectStructure } from './lib';

export default function createStore(model, options = {}) {
  const {
    compose,
    devTools = true,
    disableImmer = false,
    enhancers = [],
    initialState = {},
    injections,
    middleware = [],
    mockActions = false,
    name: storeName = `EasyPeasyStore`,
    reducerEnhancer = rootReducer => rootReducer,
  } = options;

  const bindReplaceState = modelDef => {
    return {
      ...modelDef,
      easyPeasyReplaceState: helpers.action((state, payload) => payload),
    };
  };

  let modelDefinition = bindReplaceState(model);
  let mockedActions = [];
  const references = {};

  const bindStoreInternals = (state = {}) => {
    references.internals = createStoreInternals({
      disableImmer,
      initialState: state,
      injections,
      model: modelDefinition,
      reducerEnhancer,
      references,
    });
  };

  bindStoreInternals(initialState);

  const noopStorage = {
    getItem: () => undefined,
    setItem: () => undefined,
    removeItem: () => undefined,
  };

  const localStorage =
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
      ? window.localStorage
      : noopStorage;

  const sessionStorage =
    typeof window !== 'undefined' &&
    typeof window.sessionStorage !== 'undefined'
      ? window.sessionStorage
      : noopStorage;

  const resolvePersistTargets = (state, root, whitelist, blacklist) => {
    let targets = Object.keys(get(root, state));
    if (whitelist) {
      targets = targets.reduce((acc, cur) => {
        if (whitelist.findIndex(x => x === cur) !== -1) {
          return [...acc, cur];
        }
        return acc;
      }, []);
    }
    if (blacklist) {
      targets = targets.reduce((acc, cur) => {
        if (blacklist.findIndex(x => x === cur) !== -1) {
          return acc;
        }
        return [...acc, cur];
      }, []);
    }
    return targets;
  };

  // Perform state rehydration...
  let resolveRehydration = Promise.resolve();
  if (references.internals.persistenceConfig.length > 0) {
    references.internals.persistenceConfig.forEach(persistInstance => {
      const { path, config, whitelist, blacklist } = persistInstance;
      const { strategy = 'merge' } = config;
      let storage;
      if (config.storage == null) {
        storage = localStorage;
      } else if (typeof config.storage === 'string') {
        if (config.storage === 'local') {
          config.storage = localStorage;
        } else if (config.storage === 'session') {
          config.storage = sessionStorage;
        } else {
          // TODO: Should we print a warning to console
          config.storage = noop;
        }
      } else {
        // TODO: Validate the storage is valid?
        storage = config.storage;
      }
      const isAsyncStorage = isPromise(storage.getItem('__fooooooo__'));

      const targets = resolvePersistTargets(
        references.internals.defaultState,
        path,
        whitelist,
        blacklist,
      );

      const applyRehydrationStrategy = (state, next) => {
        if (strategy === 'overwrite') {
          set(path, state, next);
        } else if (strategy === 'merge') {
          const target = get(path, state);
          Object.keys(next).forEach(key => {
            target[key] = next[key];
          });
        } else if (strategy === 'mergeDeep') {
          const target = get(path, state);
          const setAt = (currentTarget, currentNext) => {
            Object.keys(currentNext).forEach(key => {
              const data = currentNext[key];
              if (typeof data === 'object') {
                if (typeof currentTarget[key] !== 'object') {
                  currentTarget[key] = {};
                }
                setAt(currentTarget[key], data);
              } else {
                currentTarget[key] = data;
              }
            });
          };
          setAt(target, next);
        }
      };

      if (isAsyncStorage) {
        const asyncStateResolvers = targets.reduce((acc, key) => {
          const targetPath = [...path, key];
          const dataPromise = storage.getItem(targetPath.join('.'));
          if (isPromise(dataPromise)) {
            acc.push({
              key,
              dataPromise,
            });
          }
          return acc;
        }, []);
        if (asyncStateResolvers.length > 0) {
          resolveRehydration = Promise.all(
            asyncStateResolvers.map(x => x.dataPromise),
          ).then(resolvedData => {
            const next = resolvedData.reduce((acc, cur, idx) => {
              const { key } = asyncStateResolvers[idx];
              if (cur !== undefined) {
                acc[key] = cur;
              }
              return acc;
            }, {});
            if (Object.keys(next).length === 0) {
              return;
            }
            const state = deepCloneObjectStructure(references.getState());
            applyRehydrationStrategy(state, next);
            references.internals.actionCreatorDict[
              '@action.easyPeasyReplaceState'
            ](state);
          });
        }
      } else {
        const next = targets.reduce((acc, key) => {
          const targetPath = [...path, key];
          const data = storage.getItem(targetPath.join('.'));
          if (data !== undefined) {
            acc[key] = data;
          }
          return acc;
        }, {});
        applyRehydrationStrategy(references.internals.defaultState, next);
      }
    });
  }

  const persist = debounce(() => {
    references.internals.persistenceConfig.forEach(persistInstance => {
      const { path, config } = persistInstance;
      const { storage, whitelist, blacklist } = config;
      const state = references.getState();
      let targets = resolvePersistTargets(
        references.getState(),
        path,
        whitelist,
        blacklist,
      );
      targets.forEach(key => {
        const targetPath = [...path, key];
        storage.setItem(targetPath.join('.'), get(targetPath, state));
      });
    });
  }, 128);

  const persistMiddleware = () => next => action => {
    const result = next(action);
    if (action && references.internals.persistenceConfig.length > 0) {
      persist(result);
    }
    return result;
  };

  const listenerActionsMiddleware = () => next => action => {
    const result = next(action);
    if (
      action &&
      references.internals.listenerActionMap[action.type] &&
      references.internals.listenerActionMap[action.type].length > 0
    ) {
      const sourceAction = references.internals.actionCreatorDict[action.type];
      references.internals.listenerActionMap[action.type].forEach(
        actionCreator => {
          actionCreator({
            type: sourceAction ? sourceAction.type : action.type,
            payload: action.payload,
            error: action.error,
            result: action.result,
          });
        },
      );
    }
    return result;
  };

  const mockActionsMiddleware = () => () => action => {
    if (action != null) {
      mockedActions.push(action);
    }
    return undefined;
  };

  const computedPropertiesMiddleware = store => next => action => {
    references.internals.computedState.currentState = store.getState();
    references.internals.computedState.isInReducer = true;
    return next(action);
  };

  const easyPeasyMiddleware = [
    computedPropertiesMiddleware,
    reduxThunk,
    ...middleware,
    listenerActionsMiddleware,
    persistMiddleware,
  ];

  if (mockActions) {
    easyPeasyMiddleware.push(mockActionsMiddleware);
  }

  const composeEnhancers =
    compose ||
    (devTools &&
    typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
          name: storeName,
        })
      : reduxCompose);

  const store = reduxCreateStore(
    references.internals.reducer,
    references.internals.defaultState,
    composeEnhancers(applyMiddleware(...easyPeasyMiddleware), ...enhancers),
  );

  store.subscribe(() => {
    references.internals.computedState.isInReducer = false;
  });

  references.dispatch = store.dispatch;
  references.getState = store.getState;

  const bindActionCreators = () => {
    Object.keys(store.dispatch).forEach(actionsKey => {
      delete store.dispatch[actionsKey];
    });
    Object.keys(references.internals.actionCreators).forEach(key => {
      store.dispatch[key] = references.internals.actionCreators[key];
    });
  };

  bindActionCreators();

  const rebindStore = removeKey => {
    const currentState = store.getState();
    if (removeKey) {
      delete currentState[removeKey];
    }
    bindStoreInternals(currentState);
    store.replaceReducer(references.internals.reducer);
    references.internals.actionCreatorDict['@action.easyPeasyReplaceState'](
      references.internals.defaultState,
    );
    bindActionCreators();
  };

  return Object.assign(store, {
    addModel: (key, modelForKey) => {
      if (modelDefinition[key] && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(
          `easy-peasy: The store model already contains a model definition for "${key}"`,
        );
        store.removeModel(key);
      }
      modelDefinition[key] = modelForKey;
      rebindStore();
    },
    clearMockedActions: () => {
      mockedActions = [];
    },
    getActions: () => references.internals.actionCreators,
    getListeners: () => references.internals.listenerActionCreators,
    getMockedActions: () => [...mockedActions],
    persist: {
      clear: () => undefined,
      flush: () => persist.flush(),
      resolveRehydration: () => resolveRehydration,
    },
    reconfigure: newModel => {
      modelDefinition = bindReplaceState(newModel);
      rebindStore();
    },
    removeModel: key => {
      if (!modelDefinition[key]) {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn(
            `easy-peasy: The store model does not contain a model definition for "${key}"`,
          );
        }
        return;
      }
      delete modelDefinition[key];
      rebindStore(key);
    },
  });
}
