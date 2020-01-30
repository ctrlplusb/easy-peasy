import { modelVisitorResults, actionSymbol } from '../../constants';
import set from '../../lib/set';

function createActionCreator(actionDefinition, meta, references) {
  const type = `@action.${meta.path.join('.')}`;
  const actionMeta = actionDefinition[actionSymbol];
  actionMeta.actionName = meta.key;
  actionMeta.type = type;
  actionMeta.parent = meta.parentPath;
  actionMeta.path = meta.path;

  const actionCreator = payload => {
    const action = {
      type,
      payload,
    };
    return references.dispatch(action);
  };
  actionCreator.type = type;

  return actionCreator;
}

function actionPlugin(config, references) {
  let actionReducersDict = {};

  return {
    modelVisitor: (value, key, meta, internals) => {
      if (value != null && typeof value === 'function' && value[actionSymbol]) {
        const { path } = meta;
        const { actionCreatorDict, actionCreators } = internals;

        const actionReducer = value;
        const actionCreator = createActionCreator(value, meta, references);
        actionCreatorDict[actionCreator.type] = actionCreator;
        actionReducersDict[actionCreator.type] = actionReducer;
        if (meta.key !== 'ePRS') {
          set(path, actionCreators, actionCreator);
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
        const actionMeta = actionReducer[actionSymbol];
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
