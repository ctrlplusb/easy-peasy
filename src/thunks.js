import { thunkOnSymbol } from './constants';
import { get, isPromise } from './lib';

export function createThunkHandler(
  definition,
  references,
  injections,
  _actionCreators,
) {
  return (payload, fail) => {
    const helpers = {
      dispatch: references.dispatch,
      fail,
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
    if (definition[thunkOnSymbol] && definition.meta.resolvedTargets) {
      payload.resolvedTargets = [...definition.meta.resolvedTargets];
    }
    return definition.fn(
      get(definition.meta.parent, _actionCreators),
      payload,
      helpers,
    );
  };
}

const logThunkEventListenerError = (type, err) => {
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
        logThunkEventListenerError(type, err);
      });
    }
  } catch (err) {
    logThunkEventListenerError(type, err);
  }
};

export function createThunkActionsCreator(definition, references) {
  const actionCreator = (payload) => {
    const dispatchStart = handleEventDispatchErrors(
      definition.meta.startType,
      () =>
        references.dispatch({
          type: definition.meta.startType,
          payload,
        }),
    );

    const dispatchFail = handleEventDispatchErrors(
      definition.meta.failType,
      (err) =>
        references.dispatch({
          type: definition.meta.failType,
          payload,
          error: err,
        }),
    );

    const dispatchSuccess = handleEventDispatchErrors(
      definition.meta.successType,
      (result) =>
        references.dispatch({
          type: definition.meta.successType,
          payload,
          result,
        }),
    );

    dispatchStart();

    let failure = null;

    const fail = (_failure) => {
      failure = _failure;
    };

    const result = references.dispatch(() =>
      definition.thunkHandler(payload, fail),
    );

    if (isPromise(result)) {
      return result.then((resolved) => {
        if (failure) {
          dispatchFail(failure);
        } else {
          dispatchSuccess(resolved);
        }
        return resolved;
      });
    }

    if (failure) {
      dispatchFail(failure);
    } else {
      dispatchSuccess(result);
    }

    return result;
  };

  actionCreator.type = definition.meta.type;
  actionCreator.successType = definition.meta.successType;
  actionCreator.failType = definition.meta.failType;
  actionCreator.startType = definition.meta.startType;

  return actionCreator;
}
