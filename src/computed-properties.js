import memoizerific from 'memoizerific';
import { get } from './lib';
import { computedSymbol } from './constants';

export function createComputedPropertyBinder(
  parentPath,
  key,
  definition,
  _computedState,
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
        if (_computedState.isInReducer) {
          storeState = _computedState.currentState;
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

export function createComputedPropertiesMiddleware(references) {
  return store => next => action => {
    references.internals._computedState.currentState = store.getState();
    references.internals._computedState.isInReducer = true;
    return next(action);
  };
}
