import equal from 'fast-deep-equal/es6';

export function createComputedPropertyBinder(parentPath, key, def, _r) {
  let runOnce = false;
  let prevInputs = [];
  let prevValue;

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
          return undefined;
        }

        const inputs = def.stateResolvers.map((resolver) =>
          resolver(parentState, storeState),
        );
        if (
          runOnce &&
          (areEqual(prevInputs, inputs) ||
            (_r._i._cS.isInReducer &&
              new Error().stack.match(/shallowCopy/gi) !== null))
        ) {
          // We don't want computed properties resolved every time an action
          // is handled by the reducer. They need to remain lazy, only being
          // computed when used by a component or getState call.
          return prevValue;
        }
        prevInputs = inputs;

        const newValue = def.fn(...inputs);
        if (!areEqual(newValue, prevValue)) {
          prevValue = newValue;
        }

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
