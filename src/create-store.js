import {
  applyMiddleware,
  compose as reduxCompose,
  createStore as reduxCreateStore,
} from 'redux';
import * as helpers from './helpers';
import createStoreInternals from './create-store-internals';
import { createListenerMiddleware } from './listeners';
import deepCloneState from './lib/deep-clone-state';
import { registeredPlugins } from './plugins';

export default function createStore(model, options = {}) {
  const modelClone = deepCloneState(model);
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

  // This is the "god" object. Our evil mutable point of all contact. 😈
  const references = {};

  references.plugins = registeredPlugins.map(pluginFactory => {
    return pluginFactory(
      {
        initialState,
        injections,
        storeName,
      },
      references,
    );
  });

  references.replaceState = function replaceStateActionCreator(nextState) {
    references.internals.actionCreatorDict['@action.ePRS'](nextState);
  };

  const bindReplaceState = modelDef => {
    return {
      ...modelDef,
      ePRS: helpers.action((_, payload) => payload),
    };
  };

  let modelDefinition = bindReplaceState(modelClone);
  let mockedActions = [];

  const bindStoreInternals = (state = {}) => {
    references.internals = createStoreInternals({
      disableImmer,
      initialState: state,
      model: modelDefinition,
      reducerEnhancer,
      references,
    });
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

  const easyPeasyMiddleware = references.plugins.reduce(
    (configuredMiddleware, plugin) => {
      if (plugin.middleware != null) {
        return [...configuredMiddleware, ...plugin.middleware];
      }
      return configuredMiddleware;
    },
    [...middleware, createListenerMiddleware(references)],
  );

  if (mockActions) {
    const mockActionsMiddleware = () => () => action => {
      if (action != null && typeof action === 'object') {
        mockedActions.push(action);
      }
      // i.e. dead end. we don't call "next" on the middleware
      return undefined;
    };
    easyPeasyMiddleware.push(mockActionsMiddleware);
  }

  const store = reduxCreateStore(
    references.internals.reducer,
    references.internals.defaultState,
    composeEnhancers(applyMiddleware(...easyPeasyMiddleware), ...enhancers),
  );

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
    references.replaceState(references.internals.defaultState);
    bindActionCreators();
  };

  const easyPeasyEnhancedStore = references.plugins.reduce(
    (enhancedStore, { storeEnhancer }) => {
      if (storeEnhancer) {
        return storeEnhancer(enhancedStore);
      }
      return enhancedStore;
    },
    Object.assign(store, {
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
    }),
  );

  references.plugins.forEach(plugin => {
    if (plugin.onStoreCreated != null) {
      plugin.onStoreCreated(easyPeasyEnhancedStore);
    }
  });

  return easyPeasyEnhancedStore;
}
