import {
  applyMiddleware,
  compose as reduxCompose,
  createStore as reduxCreateStore,
} from 'redux';
import reduxThunk from 'redux-thunk';
import { get } from './lib';
import { metaSymbol, actionSymbol, thunkSymbol } from './constants';
import * as helpers from './helpers';
import createStoreInternals from './create-store-internals';

export default function createStore(model, options = {}) {
  const {
    compose,
    devTools = true,
    disableInternalSelectFnMemoize = false,
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

  const dispatchThunk = (thunk, payload) =>
    thunk(
      get(thunk[metaSymbol].parent, references.internals.actionCreators),
      payload,
      {
        dispatch: references.dispatch,
        getState: () => get(thunk[metaSymbol].parent, references.getState()),
        getStoreState: references.getState,
        injections,
        meta: thunk[metaSymbol],
      },
    );

  const dispatchThunkListeners = (name, payload) => {
    const listensForAction = references.internals.thunkListenersDict[name];
    return listensForAction && listensForAction.length > 0
      ? Promise.all(
          listensForAction.map(listenForAction =>
            dispatchThunk(listenForAction, payload),
          ),
        )
      : Promise.resolve();
  };

  const dispatchActionStringListeners = () => next => action => {
    const result = next(action);
    if (references.internals.thunkListenersDict[action.type]) {
      dispatchThunkListeners(action.type, action.payload);
    }
    return result;
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

  const store = reduxCreateStore(
    references.internals.reducer,
    references.internals.defaultState,
    composeEnhancers(
      applyMiddleware(
        reduxThunk,
        dispatchActionStringListeners,
        ...middleware,
        listenerActionsMiddleware,
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

  const dispatchActionListener = (actionName, payload) =>
    store.dispatch({
      type: '@@EP/LISTENER',
      payload,
      actionName,
    });

  const resolveActionName = action =>
    typeof action === 'function'
      ? action[actionSymbol]
        ? helpers.actionName(action)
        : action[thunkSymbol]
        ? helpers.thunkCompleteName(action)
        : undefined
      : typeof action === 'string'
      ? action
      : undefined;

  store.triggerListener = (listener, action, payload) => {
    const actionName = resolveActionName(action);
    if (
      listener.listeners[actionName] &&
      listener.listeners[actionName].length > 0
    ) {
      if (
        listener.listeners[actionName].some(handler => handler[actionSymbol])
      ) {
        dispatchActionListener(actionName, payload);
      }
      const thunkHandlers = listener.listeners[actionName].filter(
        handler => handler[thunkSymbol],
      );
      return thunkHandlers.length > 0
        ? Promise.all(
            thunkHandlers.map(handler => dispatchThunk(handler, payload)),
          ).then(() => undefined)
        : Promise.resolve();
    }
    return Promise.resolve();
  };

  store.triggerListeners = (action, payload) => {
    const actionName = resolveActionName(action);
    if (actionName) {
      const actionListenerHandlers =
        references.internals.actionListenersDict[actionName];
      if (actionListenerHandlers && actionListenerHandlers.length > 0) {
        dispatchActionListener(actionName, payload);
      }
      const thunkListenerHandlers =
        references.internals.thunkListenersDict[actionName];
      return thunkListenerHandlers && thunkListenerHandlers.length > 0
        ? Promise.all(
            thunkListenerHandlers.map(handler =>
              dispatchThunk(handler, payload),
            ),
          ).then(() => undefined)
        : Promise.resolve();
    }
    return Promise.resolve();
  };

  return store;
}
