import { actionOnSymbol, thunkOnSymbol } from './constants';
import { get } from './lib';

export function createListenerMiddleware(references) {
  return () => next => action => {
    const result = next(action);
    if (
      action &&
      references.internals._listenerActionMap[action.type] &&
      references.internals._listenerActionMap[action.type].length > 0
    ) {
      const sourceAction = references.internals._actionCreatorDict[action.type];
      references.internals._listenerActionMap[action.type].forEach(
        actionCreator => {
          actionCreator({
            type: sourceAction ? sourceAction.type : action.type,
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
  listenerDefinitions.forEach(listenerActionOrThunk => {
    const listenerMeta =
      listenerActionOrThunk[actionOnSymbol] ||
      listenerActionOrThunk[thunkOnSymbol];

    const targets = listenerMeta.targetResolver(
      get(listenerMeta.parent, _actionCreators),
      _actionCreators,
    );
    const targetTypes = (Array.isArray(targets) ? targets : [targets]).reduce(
      (acc, target) => {
        if (
          typeof target === 'function' &&
          target.type &&
          _actionCreatorDict[target.type]
        ) {
          acc.push(target.type);
        } else if (typeof target === 'string') {
          acc.push(target);
        }
        return acc;
      },
      [],
    );

    listenerMeta.resolvedTargets = targetTypes;

    targetTypes.forEach(targetType => {
      const listenerReg = _listenerActionMap[targetType] || [];
      listenerReg.push(_actionCreatorDict[listenerMeta.type]);
      _listenerActionMap[targetType] = listenerReg;
    });
  });
}
