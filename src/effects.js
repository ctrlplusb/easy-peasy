import { effectOnSymbol } from './constants';
import { get, isPromise } from './lib';

export function createEffectsMiddleware(references) {
  return (store) => (next) => (action) => {
    if (references.internals._effects.length === 0) {
      return next(action);
    }
    const prevState = store.getState();
    const result = next(action);
    const nextState = store.getState();
    references.internals._effects.forEach(
      ({ parentPath, actionCreator, dependencyResolvers }) => {
        const prevLocal = get(parentPath, prevState);
        const nextLocal = get(parentPath, nextState);
        if (prevLocal !== nextLocal) {
          const prevDependencies = dependencyResolvers.map((resolver) =>
            resolver(prevLocal),
          );
          const nextDependencies = dependencyResolvers.map((resolver) =>
            resolver(nextLocal),
          );
          const hasChanged = prevDependencies.some((dependency, idx) => {
            return dependency !== nextDependencies[idx];
          });
          if (hasChanged) {
            actionCreator(prevDependencies, nextDependencies, action);
          }
        }
      },
    );
    return result;
  };
}

export function createEffectHandler(
  effectDefinition,
  meta,
  references,
  injections,
  _actionCreators,
) {
  const actions = get(meta.parent, _actionCreators);
  let dispose;
  return (change) => {
    const helpers = {
      dispatch: references.dispatch,
      getState: () => get(meta.parent, references.getState()),
      getStoreActions: () => _actionCreators,
      getStoreState: references.getState,
      injections,
      meta,
    };
    if (dispose !== undefined) {
      const disposeResult = dispose();
      dispose = undefined;
      if (isPromise(disposeResult)) {
        disposeResult.catch((err) => {
          // We don't want the user completely clueless as to an error occurring,
          // so we'll log out to the console.
          // eslint-disable-next-line no-console
          console.log(err);
        });
      }
    }
    const effectResult = effectDefinition(actions, change, helpers);

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
  };
}

export function createEffectActionsCreator(
  effectDefinition,
  meta,
  references,
  effectHandler,
) {
  const prefix = '@effectOn';
  const type = `${prefix}.${meta.path.join('.')}`;
  const startType = `${type}(start)`;
  const successType = `${type}(success)`;
  const failType = `${type}(fail)`;

  const effectMeta = effectDefinition[effectOnSymbol];
  effectMeta.type = type;
  effectMeta.actionName = meta.key;
  effectMeta.parent = meta.parent;
  effectMeta.path = meta.path;

  const actionCreator = (previousDependencies, nextDependencies, action) => {
    const change = {
      prev: previousDependencies,
      current: nextDependencies,
      action,
    };
    const dispatchError = (err) =>
      references.dispatch({
        type: failType,
        change,
        error: err,
      });
    const dispatchSuccess = () =>
      references.dispatch({
        type: successType,
        change,
      });
    references.dispatch({
      type: startType,
      change,
    });
    try {
      const result = references.dispatch(() => effectHandler(change));
      if (isPromise(result)) {
        return result
          .then((resolved) => {
            dispatchSuccess(resolved);
            return resolved;
          })
          .catch((err) => {
            dispatchError(err);
            // Note: you can't throw the error as the user will not be able to
            // get a handle on the Promise.
          });
      }
      dispatchSuccess(result);
      return result;
    } catch (err) {
      dispatchError(err);
      throw err;
    }
  };

  actionCreator.type = type;
  actionCreator.startType = startType;
  actionCreator.successType = successType;
  actionCreator.failType = failType;

  return actionCreator;
}
