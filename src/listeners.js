import { get } from './lib';

export function createListenerMiddleware(_r) {
  return () => (next) => (action) => {
    const result = next(action);
    if (
      action &&
      _r._i._lAM[action.type] &&
      _r._i._lAM[action.type].length > 0
    ) {
      const sourceAction = _r._i._aCD[action.type];
      _r._i._lAM[action.type].forEach((actionCreator) => {
        actionCreator({
          type: sourceAction ? sourceAction.def.meta.type : action.type,
          payload: action.payload,
          error: action.error,
          result: action.result,
        });
      });
    }
    return result;
  };
}

export function bindListenerdefs(listenerdefs, _aC, _aCD, _lAM) {
  listenerdefs.forEach((def) => {
    const targets = def.targetResolver(get(def.meta.parent, _aC), _aC);

    const targetTypes = (Array.isArray(targets) ? targets : [targets]).reduce(
      (acc, target) => {
        if (
          typeof target === 'function' &&
          target.def.meta.type &&
          _aCD[target.def.meta.type]
        ) {
          if (target.def.meta.successType) {
            acc.push(target.def.meta.successType);
          } else {
            acc.push(target.def.meta.type);
          }
        } else if (typeof target === 'string') {
          acc.push(target);
        }
        return acc;
      },
      [],
    );

    def.meta.resolvedTargets = targetTypes;

    targetTypes.forEach((targetType) => {
      const listenerReg = _lAM[targetType] || [];
      listenerReg.push(_aCD[def.meta.type]);
      _lAM[targetType] = listenerReg;
    });
  });
}
