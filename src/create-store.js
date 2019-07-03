import {
  applyMiddleware,
  compose as reduxCompose,
  createStore as reduxCreateStore,
} from 'redux';
import reduxThunk from 'redux-thunk';
import * as helpers from './helpers';
import createStoreInternals from './create-store-internals';
import { useStoreActions, useStoreDispatch, useStoreState } from './hooks';

export default function createStore(model, options = {}) {
  const {
    compose,
    devTools = true,
    enhancers = [],
    initialState = {},
    injections,
    middleware = [],
    mockActions = false,
    name: storeName = `EasyPeasyStore`,
    reducerEnhancer = rootReducer => rootReducer,
  } = options;

  const modelDefinition = {
    ...model,
    logFullState: helpers.thunk((actions, payload, { getState }) => {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(getState(), null, 2));
    }),
    replaceState: helpers.action((state, payload) => payload),
  };

  const references = {};

  let mockedActions = [];

  const composeEnhancers =
    compose ||
    (devTools &&
    typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
          name: storeName,
        })
      : reduxCompose);

  const bindStoreInternals = state => {
    references.internals = createStoreInternals({
      initialState: state,
      injections,
      model: modelDefinition,
      reducerEnhancer,
      references,
    });
  };

  bindStoreInternals(initialState);

  const listenerActionsMiddleware = () => next => action => {
    const result = next(action);
    if (
      action &&
      references.internals.listenerActionMap[action.type] &&
      references.internals.listenerActionMap[action.type].length > 0
    ) {
      references.internals.listenerActionMap[action.type].forEach(
        actionCreator => {
          actionCreator(action.payload);
        },
      );
    }
    return result;
  };

  const mockActionsMiddleware = () => next => action => {
    if (mockActions) {
      if (
        action == null ||
        (typeof action === 'object' && action.type === '@@EP/LISTENER')
      ) {
        // DO NOTHING
      } else {
        mockedActions.push(action);
      }
      return undefined;
    }
    return next(action);
  };

  const currentStateMiddleware = () => next => action => {
    references.currentState = references.getState();
    return next(action);
  };

  const store = reduxCreateStore(
    references.internals.reducer,
    references.internals.defaultState,
    composeEnhancers(
      applyMiddleware(
        reduxThunk,
        ...middleware,
        listenerActionsMiddleware,
        currentStateMiddleware,
        mockActionsMiddleware,
      ),
      ...enhancers,
    ),
  );

  store.getMockedActions = () => [...mockedActions];
  store.clearMockedActions = () => {
    mockedActions = [];
  };

  references.dispatch = store.dispatch;
  references.getState = store.getState;

  // attach the action creators to dispatch
  const bindActionCreators = actionCreators => {
    Object.keys(store.dispatch).forEach(actionsKey => {
      delete store.dispatch[actionsKey];
    });
    Object.keys(actionCreators).forEach(key => {
      store.dispatch[key] = actionCreators[key];
    });
    store.getActions = () => actionCreators;
  };

  bindActionCreators(references.internals.actionCreators);

  const rebindStore = removeKey => {
    const currentState = store.getState();
    if (removeKey) {
      delete currentState[removeKey];
    }
    bindStoreInternals(store.getState());
    store.replaceReducer(references.internals.reducer);
    store.dispatch.replaceState(references.internals.defaultState);
    bindActionCreators(references.internals.actionCreators);
  };

  store.addModel = (key, modelForKey) => {
    if (modelDefinition[key] && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        `easy-peasy: The store model already contains a model definition for "${key}"`,
      );
      store.removeModel(key);
    }
    modelDefinition[key] = modelForKey;
    rebindStore();
  };

  store.removeModel = key => {
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
  };

  store.useStoreActions = useStoreActions;
  store.useStoreDispatch = useStoreDispatch;
  store.useStoreState = useStoreState;

  return store;
}
