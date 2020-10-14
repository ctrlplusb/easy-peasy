import {
  applyMiddleware,
  compose as reduxCompose,
  createStore as reduxCreateStore,
} from 'redux';
import reduxThunk from 'redux-thunk';
import * as helpers from './helpers';
import createStoreInternals from './create-store-internals';
import {
  createPersistor,
  createPersistMiddleware,
  rehydrateStateFromPersistIfNeeded,
} from './persistence';
import { createComputedPropertiesMiddleware } from './computed-properties';
import { createListenerMiddleware } from './listeners';
import { deepCloneStateWithoutComputed } from './lib';
import { createEffectsMiddleware } from './effects';

export default function createStore(model, options = {}) {
  const modelClone = deepCloneStateWithoutComputed(model);
  const {
    compose,
    devTools = process.env.NODE_ENV !== 'production',
    disableImmer = false,
    enhancers = [],
    initialState = {},
    injections = {},
    middleware = [],
    mockActions = false,
    name: storeName = `EasyPeasyStore`,
    version = 0,
    reducerEnhancer = (rootReducer) => rootReducer,
  } = options;

  if (process.env.NODE_ENV !== 'production') {
    if (typeof injections !== 'object') {
      throw new Error('[easy-peasy] Store injections must be an object');
    }
  }

  const bindReplaceState = (modelDef) => {
    return {
      ...modelDef,
      ePRS: helpers.action((_, payload) => payload),
    };
  };

  const references = {};

  let modelDefinition = bindReplaceState(modelClone);
  let mockedActions = [];

  const persistKey = (targetPath) =>
    `[${storeName}][${version}]${
      targetPath.length > 0 ? `[${targetPath.join('.')}]` : ''
    }`;
  const persistor = createPersistor(persistKey, references);
  const persistMiddleware = createPersistMiddleware(persistor, references);

  const replaceState = (nextState) =>
    references.internals._actionCreatorDict['@action.ePRS'](nextState);

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

  const mockActionsMiddleware = () => () => (action) => {
    if (action != null) {
      mockedActions.push(action);
    }
    return undefined;
  };

  const composeEnhancers =
    compose ||
    (devTools &&
    typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
          name: storeName,
        })
      : reduxCompose);

  bindStoreInternals(initialState);

  const easyPeasyMiddleware = [
    createComputedPropertiesMiddleware(references),
    ...middleware,
    reduxThunk,
    createListenerMiddleware(references),
    createEffectsMiddleware(references),
    persistMiddleware,
  ];

  if (mockActions) {
    easyPeasyMiddleware.push(mockActionsMiddleware);
  }

  const store = reduxCreateStore(
    references.internals.reducer,
    references.internals._defaultState,
    composeEnhancers(applyMiddleware(...easyPeasyMiddleware), ...enhancers),
  );

  store.subscribe(() => {
    references.internals._computedState.isInReducer = false;
  });

  references.dispatch = store.dispatch;
  references.getState = store.getState;

  const bindActionCreators = () => {
    Object.keys(store.dispatch).forEach((actionsKey) => {
      delete store.dispatch[actionsKey];
    });
    Object.keys(references.internals._actionCreators).forEach((key) => {
      store.dispatch[key] = references.internals._actionCreators[key];
    });
  };

  bindActionCreators();

  const rebindStore = (removeKey) => {
    const currentState = store.getState();
    if (removeKey) {
      delete currentState[removeKey];
    }
    bindStoreInternals(currentState);
    store.replaceReducer(references.internals.reducer);
    replaceState(references.internals._defaultState);
    bindActionCreators();
  };

  const resolveRehydration = rehydrateStateFromPersistIfNeeded(
    persistKey,
    replaceState,
    references,
  );

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
      // There may have been persisted state for a dynamic model. We should try
      // and rehydrate the specifc node
      const addModelRehydration = rehydrateStateFromPersistIfNeeded(
        persistKey,
        replaceState,
        references,
        key,
      );
      return {
        resolveRehydration: () => addModelRehydration,
      };
    },
    clearMockedActions: () => {
      mockedActions = [];
    },
    getActions: () => references.internals._actionCreators,
    getListeners: () => references.internals._listenerActionCreators,
    getMockedActions: () => [...mockedActions],
    persist: {
      clear: persistor.clear,
      flush: persistor.flush,
      resolveRehydration: () => resolveRehydration,
    },
    reconfigure: (newModel) => {
      modelDefinition = bindReplaceState(newModel);
      rebindStore();
    },
    removeModel: (key) => {
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
