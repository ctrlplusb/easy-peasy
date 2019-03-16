import {
  applyMiddleware,
  compose as reduxCompose,
  createStore as reduxCreateStore,
} from 'redux';
import reduxThunk from 'redux-thunk';
import { get } from './lib';
import { metaSymbol } from './constants';
import * as helpers from './helpers';
import createStoreInternals from './create-store-internals';

export default function createStore(model, options = {}) {
  const {
    compose,
    devTools = true,
    disableInternalSelectFnMemoize = false,
    initialState = {},
    injections,
    mockActions = false,
    middleware = [],
    reducerEnhancer = rootReducer => rootReducer,
    enhancers = [],
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

  const mockActionsMiddlware = () => next => action => {
    if (mockActions) {
      mockedActions.push(action);
      return undefined;
    }
    return next(action);
  };

  const dispatchThunkListeners = (name, payload) => {
    const listensForAction = references.internals.thunkListenersDict[name];
    return listensForAction && listensForAction.length > 0
      ? Promise.all(
          listensForAction.map(listenForAction =>
            listenForAction(
              get(
                listenForAction[metaSymbol].parent,
                references.internals.actionCreators,
              ),
              payload,
              {
                dispatch: references.dispatch,
                getState: () =>
                  get(
                    listenForAction[metaSymbol].parent,
                    references.getState(),
                  ),
                getStoreState: references.getState,
                injections,
                meta: listenForAction[metaSymbol],
              },
            ),
          ),
        )
      : Promise.resolve();
  };

  const dispatchActionStringListeners = () => next => action => {
    if (references.internals.thunkListenersDict[action.type]) {
      dispatchThunkListeners(action.type, action.payload);
    }
    return next(action);
  };

  const composeEnhancers =
    compose ||
    (devTools &&
    typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : reduxCompose);

  const bindStoreInternals = state => {
    references.internals = createStoreInternals({
      disableInternalSelectFnMemoize,
      initialState: state,
      injections,
      model: modelDefinition,
      reducerEnhancer,
      references,
    });
  };

  bindStoreInternals(initialState);

  const store = reduxCreateStore(
    references.internals.reducer,
    references.internals.defaultState,
    composeEnhancers(
      applyMiddleware(
        reduxThunk,
        dispatchActionStringListeners,
        mockActionsMiddlware,
        ...middleware,
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
  };

  bindActionCreators(references.internals.actionCreators);

  const rebindStore = () => {
    bindStoreInternals(store.getState());
    store.replaceReducer(references.internals.reducer);
    store.dispatch.replaceState(references.internals.defaultState);
    bindActionCreators(references.internals.actionCreators);
  };

  store.addModel = (key, modelForKey) => {
    if (modelDefinition[key] && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        `The store model already contains a model definition for "${key}"`,
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
          `The store model does not contain a model definition for "${key}"`,
        );
      }
      return;
    }
    delete modelDefinition[key];
    rebindStore();
  };

  return store;
}
