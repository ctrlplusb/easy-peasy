import {
  applyMiddleware,
  compose as reduxCompose,
  createStore as reduxCreateStore,
} from 'redux';
import reduxThunk from 'redux-thunk';
import * as helpers from './helpers';
import createReducer from './create-reducer';
import extractDataFromModel from './extract-data-from-model';
import {
  createPersistor,
  createPersistMiddleware,
  rehydrateStateFromPersistIfNeeded,
} from './persistence';
import { createComputedPropertiesMiddleware } from './computed-properties';
import { createListenerMiddleware } from './listeners';
import { clone } from './lib';
import { createEffectsMiddleware } from './effects';

export function createStore(model, options = {}) {
  const modelClone = clone(model);
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

  const bindReplaceState = (modelDef) => ({
    ...modelDef,
    ePRS: helpers.action((_, payload) => payload),
  });

  const _r = {};

  let modeldef = bindReplaceState(modelClone);
  let mockedActions = [];

  const persistKey = (targetPath) =>
    `[${storeName}][${version}]${
      targetPath.length > 0 ? `[${targetPath.join('.')}]` : ''
    }`;
  const persistor = createPersistor(persistKey, _r);
  const persistMiddleware = createPersistMiddleware(persistor, _r);

  const replaceState = (nextState) => _r._i._aCD['@action.ePRS'](nextState);

  const bindStoreInternals = (state = {}) => {
    const data = extractDataFromModel(modeldef, state, injections, _r);
    _r._i = {
      ...data,
      reducer: reducerEnhancer(
        createReducer(disableImmer, data._aRD, data._cR, data._cP),
      ),
    };
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
    createComputedPropertiesMiddleware(_r),
    ...middleware,
    reduxThunk,
    createListenerMiddleware(_r),
    createEffectsMiddleware(_r),
    persistMiddleware,
  ];

  if (mockActions) {
    easyPeasyMiddleware.push(mockActionsMiddleware);
  }

  const store = reduxCreateStore(
    _r._i.reducer,
    _r._i._dS,
    composeEnhancers(applyMiddleware(...easyPeasyMiddleware), ...enhancers),
  );

  store.subscribe(() => {
    _r._i._cS.isInReducer = false;
  });

  _r.dispatch = store.dispatch;
  _r.getState = store.getState;

  const bindActionCreators = () => {
    Object.keys(store.dispatch).forEach((actionsKey) => {
      delete store.dispatch[actionsKey];
    });
    Object.keys(_r._i._aC).forEach((key) => {
      store.dispatch[key] = _r._i._aC[key];
    });
  };

  bindActionCreators();

  const rebindStore = (removeKey) => {
    const currentState = store.getState();
    if (removeKey) {
      delete currentState[removeKey];
    }
    bindStoreInternals(currentState);
    store.replaceReducer(_r._i.reducer);
    replaceState(_r._i._dS);
    bindActionCreators();
  };

  const resolveRehydration = rehydrateStateFromPersistIfNeeded(
    persistKey,
    replaceState,
    _r,
  );

  return Object.assign(store, {
    addModel: (key, modelForKey) => {
      if (modeldef[key] && process.env.NODE_ENV !== 'production') {
        store.removeModel(key);
      }
      modeldef[key] = modelForKey;
      rebindStore();
      // There may have been persisted state for a dynamic model. We should try
      // and rehydrate the specifc node
      const addModelRehydration = rehydrateStateFromPersistIfNeeded(
        persistKey,
        replaceState,
        _r,
        key,
      );
      return {
        resolveRehydration: () => addModelRehydration,
      };
    },
    clearMockedActions: () => {
      mockedActions = [];
    },
    getActions: () => _r._i._aC,
    getListeners: () => _r._i._lAC,
    getMockedActions: () => [...mockedActions],
    persist: {
      clear: persistor.clear,
      flush: persistor.flush,
      resolveRehydration: () => resolveRehydration,
    },
    reconfigure: (newModel) => {
      modeldef = bindReplaceState(newModel);
      rebindStore();
    },
    removeModel: (key) => {
      if (!modeldef[key]) {
        return;
      }
      delete modeldef[key];
      rebindStore(key);
    },
  });
}
