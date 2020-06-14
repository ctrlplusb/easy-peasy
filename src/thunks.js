import { thunkOnSymbol } from './constants';
import { get, isPromise } from './lib';

export function createThunkHandler(
  definition,
  references,
  injections,
  _actionCreators,
) {
  return (payload) => {
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

export function createThunkActionsCreator(definition, references) {
  const actionCreator = (payload) => {
    const dispatchError = (err) => {
      references.dispatch({
        type: definition.meta.failType,
        payload,
        error: err,
      });
      references.dispatch({
        type: definition.meta.type,
        payload,
        error: err,
      });
    };
    const dispatchSuccess = (result) => {
      references.dispatch({
        type: definition.meta.successType,
        payload,
        result,
      });
      references.dispatch({
        type: definition.meta.type,
        payload,
        result,
      });
    };

    references.dispatch({
      type: definition.meta.startType,
      payload,
    });
    try {
      const result = references.dispatch(() =>
        definition.thunkHandler(payload),
      );
      if (isPromise(result)) {
        return result
          .then((resolved) => {
            dispatchSuccess(resolved);
            return resolved;
          })
          .catch((err) => {
            dispatchError(err);
            throw err;
          });
      }
      dispatchSuccess(result);
      return result;
    } catch (err) {
      dispatchError(err);
      throw err;
    }
  };

  actionCreator.type = definition.meta.type;
  actionCreator.successType = definition.meta.successType;
  actionCreator.failType = definition.meta.failType;
  actionCreator.startType = definition.meta.startType;

  return actionCreator;
}
