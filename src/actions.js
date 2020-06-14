import { actionOnSymbol } from './constants';

export function createActionCreator(definition, references) {
  const actionCreator = (payload) => {
    const action = {
      type: definition.meta.type,
      payload,
    };
    if (definition[actionOnSymbol] && definition.meta.resolvedTargets) {
      payload.resolvedTargets = [...definition.meta.resolvedTargets];
    }
    return references.dispatch(action);
  };

  // We bind the types to the creator for easy reference by consumers
  actionCreator.type = definition.meta.type;

  return actionCreator;
}
