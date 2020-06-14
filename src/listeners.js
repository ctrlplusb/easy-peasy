import { get } from './lib';

export function createListenerMiddleware(references) {
  return () => (next) => (action) => {
    const result = next(action);
    if (
      action &&
      references.internals._listenerActionMap[action.type] &&
      references.internals._listenerActionMap[action.type].length > 0
    ) {
      const sourceAction = references.internals._actionCreatorDict[action.type];
      references.internals._listenerActionMap[action.type].forEach(
        (actionCreator) => {
          actionCreator({
            type: sourceAction
              ? sourceAction.definition.meta.type
              : action.type,
            payload: action.payload,
            error: action.error,
            result: action.result,
          });
        },
      );
    }
    return result;
  };
}

export function bindListenerDefinitions(
  listenerDefinitions,
  _actionCreators,
  _actionCreatorDict,
  _listenerActionMap,
) {
  listenerDefinitions.forEach((definition) => {
    const targets = definition.targetResolver(
      get(definition.meta.parent, _actionCreators),
      _actionCreators,
    );

    const targetTypes = (Array.isArray(targets) ? targets : [targets]).reduce(
      (acc, target) => {
        if (
          typeof target === 'function' &&
          target.definition.meta.type &&
          _actionCreatorDict[target.definition.meta.type]
        ) {
          acc.push(target.definition.meta.type);
        } else if (typeof target === 'string') {
          acc.push(target);
        }
        return acc;
      },
      [],
    );

    definition.meta.resolvedTargets = targetTypes;

    targetTypes.forEach((targetType) => {
      const listenerReg = _listenerActionMap[targetType] || [];
      listenerReg.push(_actionCreatorDict[definition.meta.type]);
      _listenerActionMap[targetType] = listenerReg;
    });
  });
}
