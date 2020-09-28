import memoizerific from 'memoizerific';
import { get } from './lib';

export function createComputedPropertyBinder(
  parentPath,
  key,
  definition,
  _computedState,
  references,
) {
  const memoisedResultFn = memoizerific(1)(definition.fn);
  return function createComputedProperty(o) {
    Object.defineProperty(o, key, {
      configurable: true,
      enumerable: true,
      get: () => {
        let storeState;
        if (_computedState.isInReducer) {
          storeState = _computedState.currentState;
        } else if (references.getState == null) {
          return undefined;
        } else {
          try {
            storeState = references.getState();
          } catch (err) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Error, failed to executed a computed property');
              console.log(err);
            }
            return undefined;
          }
        }
        const state = get(parentPath, storeState);
        const inputs = definition.stateResolvers.map((resolver) =>
          resolver(state, storeState),
        );
        return memoisedResultFn(...inputs);
      },
    });
  };
}

export function createComputedPropertiesMiddleware(references) {
  return (store) => (next) => (action) => {
    references.internals._computedState.currentState = store.getState();
    references.internals._computedState.isInReducer = true;
    return next(action);
  };
}
