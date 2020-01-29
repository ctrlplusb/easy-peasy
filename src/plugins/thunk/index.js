import reduxThunk from 'redux-thunk';
import {
  modelVisitorResults,
  thunkSymbol,
  thunkOnSymbol,
} from '../../constants';
import { get, isPromise, set } from '../../lib';

function createThunkHandler(thunkDefinition, meta, references, injections) {
  const thunkMeta =
    thunkDefinition[thunkSymbol] || thunkDefinition[thunkOnSymbol];

  return payload => {
    const helpers = {
      dispatch: references.dispatch,
      getState: () => get(meta.parentPath, references.getState()),
      getStoreActions: () => references.internals.actionCreators,
      getStoreState: references.getState,
      injections,
      meta: {
        key: meta.key,
        parent: meta.parentPath,
        path: meta.path,
      },
    };
    if (thunkDefinition[thunkOnSymbol] && thunkMeta.resolvedTargets) {
      payload.resolvedTargets = [...thunkMeta.resolvedTargets];
    }
    return thunkDefinition(
      get(meta.parentPath, references.internals.actionCreators),
      payload,
      helpers,
    );
  };
}

function createThunkActionsCreator(
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
  thunkMeta.parent = meta.parentPath;
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

function thunkPlugin(config, references) {
  const { injections } = config;

  return {
    middleware: [reduxThunk],
    storeEnhancer: store => store,
    modelVisitor: (value, key, meta, internals) => {
      if (
        value != null &&
        typeof value === 'function' &&
        (value[thunkSymbol] || value[thunkOnSymbol])
      ) {
        const { path } = meta;
        const {
          actionCreatorDict,
          actionCreators,
          listenerActionCreators,
          listenerDefinitions,
        } = internals;
        const thunkHandler = createThunkHandler(
          value,
          meta,
          references,
          injections,
        );
        const actionCreator = createThunkActionsCreator(
          value,
          meta,
          references,
          thunkHandler,
        );
        actionCreatorDict[actionCreator.type] = actionCreator;
        if (value[thunkOnSymbol]) {
          listenerDefinitions.push(value);
          set(path, listenerActionCreators, actionCreator);
        } else {
          set(path, actionCreators, actionCreator);
        }
        return modelVisitorResults.CONTINUE;
      }
      return undefined;
    },
    onStoreCreated: () => {},
  };
}

thunkPlugin.pluginName = 'thunk';

export default thunkPlugin;
