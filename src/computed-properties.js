import { get, memoizeOne } from './lib';

export function createComputedPropertyBinder(
  parentPath,
  key,
  definition,
  references,
) {
  const memoisedResultFn = memoizeOne(definition.fn);
  return function createComputedProperty(parentState, storeState) {
    Object.defineProperty(parentState, key, {
      configurable: true,
      enumerable: true,
      get: () => {
        if (references.internals._computedState.isInReducer) {
          // We don't want computed properties resolved every time an action
          // is handled by the reducer. They need to remain lazy, only being
          // computed when used by a component or getState call.
          return undefined;
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
  return () => (next) => (action) => {
    references.internals._computedState.isInReducer = true;
    return next(action);
  };
}
