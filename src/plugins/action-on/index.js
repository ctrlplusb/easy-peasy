import { modelVisitorResults, actionOnSymbol } from '../../constants';
import set from '../../lib/set';
import createSimpleProduce from '../../lib/create-simple-produce';

function createActionCreator(actionDefinition, meta, references) {
  const type = `@actionOn.${meta.path.join('.')}`;
  const actionMeta = actionDefinition[actionOnSymbol];
  actionMeta.actionName = meta.key;
  actionMeta.type = type;
  actionMeta.parent = meta.parentPath;
  actionMeta.path = meta.path;

  const actionCreator = payload => {
    const action = {
      type,
      payload,
    };
    if (actionMeta.resolvedTargets) {
      payload.resolvedTargets = [...actionMeta.resolvedTargets];
    }
    return references.dispatch(action);
  };
  actionCreator.type = type;

  return actionCreator;
}

function actionOnPlugin(config, references) {
  let actionOnReducersDict;

  const simpleProduce = createSimpleProduce(config.disableImmer);

  return {
    modelVisitor: (value, key, meta) => {
      if (
        value != null &&
        typeof value === 'function' &&
        value[actionOnSymbol]
      ) {
        const { path } = meta;

        const actionReducer = value;
        const actionCreator = createActionCreator(value, meta, references);
        references.internals.actionCreatorDict[
          actionCreator.type
        ] = actionCreator;
        actionOnReducersDict[actionCreator.type] = actionReducer;
        if (meta.key !== 'ePRS') {
          references.pluginsState.listener.listenerDefinitions.push(value);
          set(
            path,
            references.pluginsState.listener.listenerActionCreators,
            actionCreator,
          );
        }
        return modelVisitorResults.CONTINUE;
      }
      return undefined;
    },
    onBeforeParseModel: () => {
      actionOnReducersDict = {};
    },
    reducer: (state, action) => {
      const actionOnReducer = actionOnReducersDict[action.type];
      if (actionOnReducer) {
        const actionMeta = actionOnReducer[actionOnSymbol];
        return simpleProduce(actionMeta.parent, state, draft =>
          actionOnReducer(draft, action.payload),
        );
      }
      return state;
    },
  };
}

actionOnPlugin.pluginName = 'action-on';

export default actionOnPlugin;
