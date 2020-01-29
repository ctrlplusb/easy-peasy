import {
  modelVisitorResults,
  actionSymbol,
  actionOnSymbol,
} from '../../constants';
import get from '../../lib/get';
import set from '../../lib/set';

function createActionCreator(actionDefinition, meta, references) {
  const prefix = actionDefinition[actionSymbol] ? '@action' : '@actionOn';
  const type = `${prefix}.${meta.path.join('.')}`;
  const actionMeta =
    actionDefinition[actionSymbol] || actionDefinition[actionOnSymbol];
  actionMeta.actionName = meta.key;
  actionMeta.type = type;
  actionMeta.parent = meta.parentPath;
  actionMeta.path = meta.path;

  const actionCreator = payload => {
    const action = {
      type,
      payload,
    };
    if (actionDefinition[actionOnSymbol] && actionMeta.resolvedTargets) {
      payload.resolvedTargets = [...actionMeta.resolvedTargets];
    }
    const result = references.dispatch(action);
    return result;
  };
  actionCreator.type = type;

  return actionCreator;
}

function actionPlugin(config, references) {
  let actionReducersDict = {};

  return {
    modelVisitor: (value, key, meta, internals) => {
      if (
        value != null &&
        typeof value === 'function' &&
        (value[actionSymbol] || value[actionOnSymbol])
      ) {
        const { path } = meta;
        const {
          actionCreatorDict,
          actionCreators,
          listenerActionCreators,
          listenerDefinitions,
        } = internals;

        const actionReducer = value;
        const actionCreator = createActionCreator(value, meta, references);
        actionCreatorDict[actionCreator.type] = actionCreator;
        actionReducersDict[actionCreator.type] = actionReducer;
        if (meta.key !== 'ePRS') {
          if (value[actionOnSymbol]) {
            listenerDefinitions.push(value);
            set(path, listenerActionCreators, actionCreator);
          } else {
            set(path, actionCreators, actionCreator);
          }
        }

        return modelVisitorResults.CONTINUE;
      }
      return undefined;
    },
    onBeforeCreateStore: () => {
      actionReducersDict = {};
    },
    reducer: (state, action, internals) => {
      const actionReducer = actionReducersDict[action.type];
      if (actionReducer) {
        const actionMeta =
          actionReducer[actionSymbol] || actionReducer[actionOnSymbol];
        return internals.simpleProduce(actionMeta.parent, state, draft =>
          actionReducer(draft, action.payload),
        );
      }
      return state;
    },
  };
}

actionPlugin.pluginName = 'action';

export default actionPlugin;
