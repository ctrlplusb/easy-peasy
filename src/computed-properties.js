import { get, memoizeOne } from './lib';

export function createComputedPropertyBinder(parentPath, key, def, _r) {
  const memoisedResultFn = memoizeOne(def.fn);
  let previousValue;
  return function createComputedProperty(parentState, storeState) {
    Object.defineProperty(parentState, key, {
      configurable: true,
      enumerable: true,
      get: () => {
        if (previousValue !== undefined && _r._i._cS.isInReducer) {
          // We don't want computed properties resolved every time an action
          // is handled by the reducer. They need to remain lazy, only being
          // computed when used by a component or getState call.
          return previousValue;
        }
        const state = get(parentPath, storeState);
        const inputs = def.stateResolvers.map((resolver) =>
          resolver(state, storeState),
        );
        previousValue = memoisedResultFn(...inputs);
        return previousValue;
      },
    });
  };
}

export function createComputedPropertiesMiddleware(_r) {
  return () => (next) => (action) => {
    _r._i._cS.isInReducer = true;
    const result = next(action);
    _r._i._cS.isInReducer = false;
    return result;
  };
}
