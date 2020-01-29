import memoizerific from 'memoizerific';
import get from '../../lib/get';
import { computedSymbol, modelVisitorResults } from '../../constants';

function createComputedPropertyBinder(
  parentPath,
  key,
  definition,
  computedState,
  references,
) {
  const computedMeta = definition[computedSymbol];
  const memoisedResultFn = memoizerific(1)(definition);
  return function createComputedProperty(o) {
    Object.defineProperty(o, key, {
      configurable: true,
      enumerable: true,
      get: () => {
        let storeState;
        if (computedState.isInReducer) {
          storeState = computedState.currentState;
        } else if (references.getState == null) {
          return undefined;
        } else {
          try {
            storeState = references.getState();
          } catch (err) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Invalid access attempt to a computed property');
            }
            return undefined;
          }
        }
        const state = get(parentPath, storeState);
        const inputs = computedMeta.stateResolvers.map(resolver =>
          resolver(state, storeState),
        );
        return memoisedResultFn(...inputs);
      },
    });
  };
}

function computedPlugin(config, references) {
  const computedState = {
    currentState: {},
    isInReducer: false,
  };

  const computedPropertiesMiddleware = store => next => action => {
    computedState.currentState = store.getState();
    computedState.isInReducer = true;
    return next(action);
  };

  let computedProperties = [];

  return {
    onBeforeCreateStore: ({ initialState }) => {
      computedProperties = [];
      computedState.currentState = initialState;
    },
    onReducerStateChanged: (prevState, nextState) => {
      computedProperties.forEach(({ parentPath, bindComputedProperty }) => {
        bindComputedProperty(get(parentPath, nextState));
      });
    },
    onStoreCreated: store => {
      store.subscribe(() => {
        // This always fires after a reducer has completed, therefore it is
        // a good place to reset our flag state which tracks when we are in
        // a reducer.
        computedState.isInReducer = false;
      });
    },
    middleware: [computedPropertiesMiddleware],
    modelVisitor: (value, key, meta) => {
      if (typeof value === 'function' && value[computedSymbol]) {
        const { parent, parentPath } = meta;
        const bindComputedProperty = createComputedPropertyBinder(
          parentPath,
          key,
          value,
          computedState,
          references,
        );
        bindComputedProperty(parent);
        computedProperties.push({
          key,
          parentPath,
          bindComputedProperty,
        });
        return modelVisitorResults.CONTINUE;
      }
      return undefined;
    },
  };
}

computedPlugin.pluginName = 'computed';

export default computedPlugin;
