import { areInputsEqual } from './lib';

export function createComputedPropertyBinder(parentPath, key, def, _r) {
  let runOnce = false;
  let prevInputs = [];
  let prevValue;
  return function createComputedProperty(parentState, storeState) {
    Object.defineProperty(parentState, key, {
      configurable: true,
      enumerable: true,
      get: () => {
        const inputs = def.stateResolvers.map((resolver) =>
          resolver(parentState, storeState),
        );
        if (
          runOnce &&
          (areInputsEqual(prevInputs, inputs) ||
            (_r._i._cS.isInReducer &&
              new Error().stack.match(/shallowCopy/gi) !== null))
        ) {
          // We don't want computed properties resolved every time an action
          // is handled by the reducer. They need to remain lazy, only being
          // computed when used by a component or getState call.
          return prevValue;
        }
        prevInputs = inputs;
        prevValue = def.fn(...inputs);
        runOnce = true;
        return prevValue;
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
