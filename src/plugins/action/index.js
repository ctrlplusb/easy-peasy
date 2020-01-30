import { modelVisitorResults, actionSymbol } from '../../constants';
import set from '../../lib/set';
import createSimpleProduce from '../../lib/create-simple-produce';

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

  const simpleProduce = createSimpleProduce(config.disableImmer);

  return {
    modelVisitor: (value, key, meta) => {
      if (value != null && typeof value === 'function' && value[actionSymbol]) {
        const { path } = meta;

        const actionReducer = value;
        const actionCreator = createActionCreator(value, meta, references);
        references.internals.actionCreatorDict[
          actionCreator.type
        ] = actionCreator;
        actionReducersDict[actionCreator.type] = actionReducer;
        if (meta.key !== 'ePRS') {
          set(path, references.internals.actionCreators, actionCreator);
        }

        return modelVisitorResults.CONTINUE;
      }
      return undefined;
    },
    onBeforeParseModel: () => {
      actionReducersDict = {};
    },
    reducer: (state, action) => {
      const actionReducer = actionReducersDict[action.type];
      if (actionReducer) {
        const actionMeta = actionReducer[actionSymbol];
        return simpleProduce(actionMeta.parent, state, draft =>
          actionReducer(draft, action.payload),
        );
      }
      return state;
    },
  };
}

actionPlugin.pluginName = 'action';

export default actionPlugin;
