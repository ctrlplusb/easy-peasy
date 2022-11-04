import { get, isPromise } from './lib';

export function createEffectsMiddleware(references) {
  return (store) => (next) => (action) => {
    if (references.internals._effects.length === 0) {
      return next(action);
    }
    const prevState = store.getState();
    const result = next(action);
    const nextState = store.getState();
    if (prevState !== nextState) {
      references.internals._effects.forEach((definition) => {
        const prevLocal = get(definition.meta.parent, prevState);
        const nextLocal = get(definition.meta.parent, nextState);
        const prevDependencies = definition.dependencyResolvers.map(
          (resolver) => resolver(prevLocal, prevState),
        );
        const nextDependencies = definition.dependencyResolvers.map(
          (resolver) => resolver(nextLocal, nextState),
        );
        const hasChanged = prevDependencies.some((dependency, idx) => {
          return dependency !== nextDependencies[idx];
        });
        if (hasChanged) {
          definition.actionCreator(prevDependencies, nextDependencies, action);
        }
      });
    }
    return result;
  };
}

const logEffectError = (err) => {
  // As users can't get a handle on effects we need to report the error
  // eslint-disable-next-line no-console
  console.log(err);
};

export function createEffectHandler(
  definition,
  references,
  injections,
  _actionCreators,
) {
  const actions = get(definition.meta.parent, _actionCreators);

  let dispose;

  return (change) => {
    const helpers = {
      dispatch: references.dispatch,
      getState: () => get(definition.meta.parent, references.getState()),
      getStoreActions: () => _actionCreators,
      getStoreState: references.getState,
      injections,
      meta: {
        key: definition.meta.actionName,
        parent: definition.meta.parent,
        path: definition.meta.path,
      },
    };

    if (dispose !== undefined) {
      const disposeResult = dispose();
      dispose = undefined;
      if (isPromise(disposeResult)) {
        disposeResult.catch(logEffectError);
      }
    }

    const effectResult = definition.fn(actions, change, helpers);

    if (isPromise(effectResult)) {
      return effectResult.then((resolved) => {
        if (typeof resolved === 'function') {
          if (process.env.NODE_ENV !== 'production') {
            // Dispose functions are not allowed to be resolved asynchronously.
            // Doing so would provide inconsistent behaviour around their execution.
            // eslint-disable-next-line no-console
            console.warn(
              '[easy-peasy] You have an effect which is asynchronously resolving a dispose function. This is considered an anti-pattern. Please read the API documentation for more information.',
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
  console.log(`An error occurred in a listener for ${type}`);
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

export function createEffectActionsCreator(
  definition,
  references,
  effectHandler,
) {
  const actionCreator = (previousDependencies, nextDependencies, action) => {
    const change = {
      prev: previousDependencies,
      current: nextDependencies,
      action,
    };

    const dispatchStart = handleEventDispatchErrors(
      definition.meta.startType,
      () =>
        references.dispatch({
          type: definition.meta.startType,
          change,
        }),
    );

    const dispatchSuccess = handleEventDispatchErrors(
      definition.meta.successType,
      () =>
        references.dispatch({
          type: definition.meta.successType,
          change,
        }),
    );

    dispatchStart();

    try {
      const result = references.dispatch(() => effectHandler(change));

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

  actionCreator.type = definition.meta.type;
  actionCreator.startType = definition.meta.startType;
  actionCreator.successType = definition.meta.successType;
  actionCreator.failType = definition.meta.failType;

  return actionCreator;
}
