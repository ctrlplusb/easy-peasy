import { get, isPromise } from './lib';

export function createEffectsMiddleware(_r) {
  return (store) => (next) => (action) => {
    if (_r._i._e.length === 0) {
      return next(action);
    }
    const prevState = store.getState();
    const result = next(action);
    const nextState = store.getState();
    _r._i._e.forEach((def) => {
      const prevLocal = get(def.meta.parent, prevState);
      const nextLocal = get(def.meta.parent, nextState);
      if (prevLocal !== nextLocal) {
        const prevDependencies = def.dependencyResolvers.map((resolver) =>
          resolver(prevLocal),
        );
        const nextDependencies = def.dependencyResolvers.map((resolver) =>
          resolver(nextLocal),
        );
        const hasChanged = prevDependencies.some(
          (dependency, idx) => dependency !== nextDependencies[idx],
        );
        if (hasChanged) {
          def.actionCreator(prevDependencies, nextDependencies, action);
        }
      }
    });
    return result;
  };
}

const logEffectError = (err) => {
  // As users can't get a handle on effects we need to report the error
  // eslint-disable-next-line no-console
  console.log(err);
};

export function createEffectHandler(def, _r, injections, _aC) {
  const actions = get(def.meta.parent, _aC);

  let dispose;

  return (change) => {
    const helpers = {
      dispatch: _r.dispatch,
      getState: () => get(def.meta.parent, _r.getState()),
      getStoreActions: () => _aC,
      getStoreState: _r.getState,
      injections,
      meta: {
        key: def.meta.actionName,
        parent: def.meta.parent,
        path: def.meta.path,
      },
    };

    if (dispose !== undefined) {
      const disposeResult = dispose();
      dispose = undefined;
      if (isPromise(disposeResult)) {
        disposeResult.catch(logEffectError);
      }
    }

    const effectResult = def.fn(actions, change, helpers);

    if (isPromise(effectResult)) {
      return effectResult.then((resolved) => {
        if (typeof resolved === 'function') {
          if (process.env.NODE_ENV !== 'production') {
            // Dispose functions are not allowed to be resolved asynchronously.
            // Doing so would provide inconsistent behaviour around their execution.
            // eslint-disable-next-line no-console
            console.warn(
              '[easy-peasy] Effect is asynchronously resolving a dispose fn.',
            );
          }
        }
      });
    }

    if (typeof effectResult === 'function') {
      dispose = effectResult;
    }

    return undefined;
  };
}

const logEffectEventListenerError = (type, err) => {
  // eslint-disable-next-line no-console
  console.log(`Error in ${type}`);
  // eslint-disable-next-line no-console
  console.log(err);
};

const handleEventDispatchErrors = (type, dispatcher) => (...args) => {
  try {
    const result = dispatcher(...args);
    if (isPromise(result)) {
      result.catch((err) => {
        logEffectEventListenerError(type, err);
      });
    }
  } catch (err) {
    logEffectEventListenerError(type, err);
  }
};

export function createEffectActionsCreator(def, _r, effectHandler) {
  const actionCreator = (previousDependencies, nextDependencies, action) => {
    const change = {
      prev: previousDependencies,
      current: nextDependencies,
      action,
    };

    const dispatchStart = handleEventDispatchErrors(def.meta.startType, () =>
      _r.dispatch({
        type: def.meta.startType,
        change,
      }),
    );

    const dispatchSuccess = handleEventDispatchErrors(
      def.meta.successType,
      () =>
        _r.dispatch({
          type: def.meta.successType,
          change,
        }),
    );

    dispatchStart();

    try {
      const result = _r.dispatch(() => effectHandler(change));

      if (isPromise(result)) {
        return result.then((resolved) => {
          dispatchSuccess(resolved);
          return resolved;
        }, logEffectError);
      }

      dispatchSuccess(result);

      return result;
    } catch (err) {
      logEffectError(err);
    }
  };

  actionCreator.type = def.meta.type;
  actionCreator.startType = def.meta.startType;
  actionCreator.successType = def.meta.successType;
  actionCreator.failType = def.meta.failType;

  return actionCreator;
}
