import { thunkOnSymbol } from './constants';
import { get, isPromise } from './lib';

export function createThunkHandler(def, _r, injections, _aC) {
  return (payload, fail) => {
    const helpers = {
      dispatch: _r.dispatch,
      fail,
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
    if (def[thunkOnSymbol] && def.meta.resolvedTargets) {
      payload.resolvedTargets = [...def.meta.resolvedTargets];
    }
    return def.fn(get(def.meta.parent, _aC), payload, helpers);
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

export function createThunkActionsCreator(def, _r) {
  const actionCreator = (payload) => {
    const dispatchStart = handleEventDispatchErrors(def.meta.startType, () =>
      _r.dispatch({
        type: def.meta.startType,
        payload,
      }),
    );

    const dispatchFail = handleEventDispatchErrors(def.meta.failType, (err) =>
      _r.dispatch({
        type: def.meta.failType,
        payload,
        error: err,
      }),
    );

    const dispatchSuccess = handleEventDispatchErrors(
      def.meta.successType,
      (result) =>
        _r.dispatch({
          type: def.meta.successType,
          payload,
          result,
        }),
    );

    dispatchStart();

    let failure = null;

    const fail = (_failure) => {
      failure = _failure;
    };

    const result = _r.dispatch(() => def.thunkHandler(payload, fail));

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

  actionCreator.type = def.meta.type;
  actionCreator.successType = def.meta.successType;
  actionCreator.failType = def.meta.failType;
  actionCreator.startType = def.meta.startType;

  return actionCreator;
}
