import { actionOnSymbol } from './constants';

export function createActionCreator(def, _r) {
  function actionCreator(payload) {
    const action = {
      type: def.meta.type,
      payload,
    };
    if (def[actionOnSymbol] && def.meta.resolvedTargets) {
      payload.resolvedTargets = [...def.meta.resolvedTargets];
    }
    return _r.dispatch(action);
  }

  // We bind the types to the creator for easy reference by consumers
  actionCreator.type = def.meta.type;

  return actionCreator;
}
