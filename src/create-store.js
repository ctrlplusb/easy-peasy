import {
  applyMiddleware,
  compose as reduxCompose,
  createStore as reduxCreateStore,
} from 'redux';
import reduxThunk from 'redux-thunk';
import debounce from 'debounce';
import * as helpers from './helpers';
import createStoreInternals from './create-store-internals';
import {
  deepCloneStateWithoutComputed,
  get,
  isPromise,
  resolvePersistTargets,
  set,
} from './lib';

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

  const persistKey = targetPath => `[${storeName}]@${targetPath.join('.')}`;

  const replaceState = nextState =>
    references.internals.actionCreatorDict['@action.easyPeasyReplaceState'](
      nextState,
    );

  const persist = debounce(() => {
    references.internals.persistenceConfig.forEach(({ path, config }) => {
      const { storage, whitelist, blacklist } = config;
      const state = references.getState();
      const persistRoot = deepCloneStateWithoutComputed(get(path, state));
      const targets = resolvePersistTargets(persistRoot, whitelist, blacklist);
      targets.forEach(key => {
        const targetPath = [...path, key];
        storage.setItem(persistKey(targetPath), get(targetPath, state));
      });
    });
  }, 1000);

  const clearPersistance = () =>
    new Promise((resolve, reject) => {
      references.internals.persistenceConfig.forEach(({ path, config }) => {
        const { storage, whitelist, blacklist } = config;
        const persistRoot = get(path, references.getState());
        const targets = resolvePersistTargets(
          persistRoot,
          whitelist,
          blacklist,
        );
        if (targets.length > 0) {
          Promise.all(
            targets.map(key => {
              const targetPath = [...path, key];
              return storage.removeItem(persistKey(targetPath));
            }),
          ).then(() => resolve(), reject);
        } else {
          resolve();
        }
      });
    });

  const persistMiddleware = () => next => action => {
    const result = next(action);
    if (
      action &&
      action.type !== '@action.easyPeasyReplaceState' &&
      references.internals.persistenceConfig.length > 0
    ) {
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
    replaceState(references.internals.defaultState);
    bindActionCreators();
  };

  // If we have any persist configs we will attemp to perform a state rehydration
  let resolveRehydration = Promise.resolve();
  if (references.internals.persistenceConfig.length > 0) {
    references.internals.persistenceConfig.forEach(persistInstance => {
      const { path, config } = persistInstance;
      const { blacklist, mergeStrategy, storage, whitelist } = config;

      const state = references.internals.defaultState;
      const persistRoot = deepCloneStateWithoutComputed(get(path, state));
      const targets = resolvePersistTargets(persistRoot, whitelist, blacklist);

      const applyRehydrationStrategy = (originalState, rehydratedState) => {
        if (mergeStrategy === 'overwrite') {
          set(path, originalState, rehydratedState);
        } else if (mergeStrategy === 'merge') {
          const target = get(path, originalState);
          Object.keys(rehydratedState).forEach(key => {
            target[key] = rehydratedState[key];
          });
        } else if (mergeStrategy === 'mergeDeep') {
          const target = get(path, originalState);
          const setAt = (currentTarget, currentNext) => {
            Object.keys(currentNext).forEach(key => {
              const data = currentNext[key];
              if (typeof data === 'object') {
                setAt(currentTarget[key], data);
              } else {
                currentTarget[key] = data;
              }
            });
          };
          setAt(target, rehydratedState);
        }
      };

      if (storage.isAsync) {
        const asyncStateResolvers = targets.reduce((acc, key) => {
          const targetPath = [...path, key];
          const dataPromise = storage.getItem(persistKey(targetPath));
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
            applyRehydrationStrategy(state, next);
            replaceState(state);
          });
        }
      } else {
        const next = targets.reduce((acc, key) => {
          const targetPath = [...path, key];
          const data = storage.getItem(persistKey(targetPath));
          if (data !== undefined) {
            acc[key] = data;
          }
          return acc;
        }, {});
        applyRehydrationStrategy(state, next);
        replaceState(state);
      }
    });
  }

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
      clear: clearPersistance,
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
