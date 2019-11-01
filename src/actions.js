import { actionSymbol, actionOnSymbol } from './constants';

export function createActionCreator(actionDefinition, meta, references) {
  const prefix = actionDefinition[actionSymbol] ? '@action' : '@actionOn';
  const type = `${prefix}.${meta.path.join('.')}`;
  const actionMeta =
    actionDefinition[actionSymbol] || actionDefinition[actionOnSymbol];
  actionMeta.actionName = meta.key;
  actionMeta.type = type;
  actionMeta.parent = meta.parent;
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
