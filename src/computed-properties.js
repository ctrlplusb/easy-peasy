import equal from 'fast-deep-equal/es6';
import { areInputsEqual } from './lib';

export function createComputedPropertyBinder(key, def, _r) {
  let hasRunOnce = false;
  let prevInputs = [];
  let prevValue;
  let prevStoreState;

  let performingEqualityCheck = false;

  const areEqual = (a, b) => {
    performingEqualityCheck = true;
    const result = equal(a, b);
    performingEqualityCheck = false;
    return result;
  };

  return function createComputedProperty(parentState, storeState) {
    Object.defineProperty(parentState, key, {
      configurable: true,
      enumerable: true,
      get: () => {
        if (performingEqualityCheck) {
          return prevValue;
        }

        const inputs = def.stateResolvers.map((resolver) =>
          resolver(parentState, storeState),
        );

        if (
          hasRunOnce &&
          ((storeState === prevStoreState &&
            areInputsEqual(inputs, prevInputs)) ||
            // We don't want computed properties resolved every time an action
            // is handled by the reducer. They need to remain lazy, only being
            // computed when used by a component or getState call;
            (_r._i._cS.isInReducer &&
              // This is to account for strange errors that may occur via immer;
              new Error().stack.match(/shallowCopy/gi) !== null))
        ) {
          return prevValue;
        }

        const newValue = def.fn(...inputs);
        if (!areEqual(newValue, prevValue)) {
          prevValue = newValue;
        }

        prevInputs = inputs;
        prevStoreState = storeState;
        hasRunOnce = true;
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
