import { thunkSymbol, thunkOnSymbol } from './constants';
import { get, isPromise } from './lib';

export function createThunkHandler(
  thunkDefinition,
  meta,
  references,
  injections,
  actionCreators,
) {
  const thunkMeta =
    thunkDefinition[thunkSymbol] || thunkDefinition[thunkOnSymbol];

  return payload => {
    const helpers = {
      dispatch: references.dispatch,
      getState: () => get(meta.parent, references.getState()),
      getStoreActions: () => actionCreators,
      getStoreState: references.getState,
      injections,
      meta,
    };
    if (thunkDefinition[thunkOnSymbol] && thunkMeta.resolvedTargets) {
      payload.resolvedTargets = [...thunkMeta.resolvedTargets];
    }
    return thunkDefinition(get(meta.parent, actionCreators), payload, helpers);
  };
}

export function createThunkActionsCreator(
  thunkDefinition,
  meta,
  references,
  thunkHandler,
) {
  const prefix = thunkDefinition[thunkSymbol] ? '@thunk' : '@thunkOn';
  const type = `${prefix}.${meta.path.join('.')}`;
  const startType = `${type}(start)`;
  const successType = `${type}(success)`;
  const failType = `${type}(fail)`;

  const thunkMeta =
    thunkDefinition[thunkSymbol] || thunkDefinition[thunkOnSymbol];
  thunkMeta.type = type;
  thunkMeta.actionName = meta.key;
  thunkMeta.parent = meta.parent;
  thunkMeta.path = meta.path;

  const actionCreator = payload => {
    const dispatchError = err => {
      references.dispatch({
        type: failType,
        payload,
        error: err,
      });
      references.dispatch({
        type,
        payload,
        error: err,
      });
    };
    const dispatchSuccess = result => {
      references.dispatch({
        type: successType,
        payload,
        result,
      });
      references.dispatch({
        type,
        payload,
        result,
      });
    };

    references.dispatch({
      type: startType,
      payload,
    });
    try {
      const result = references.dispatch(() => thunkHandler(payload));
      if (isPromise(result)) {
        return result
          .then(resolved => {
            dispatchSuccess(resolved);
            return resolved;
          })
          .catch(err => {
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

  actionCreator.type = type;
  actionCreator.startType = startType;
  actionCreator.successType = successType;
  actionCreator.failType = failType;

  return actionCreator;
}
