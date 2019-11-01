export function createListenerMiddleware(references) {
  return () => next => action => {
    const result = next(action);
    if (
      action &&
      references.internals.listenerActionMap[action.type] &&
      references.internals.listenerActionMap[action.type].length > 0
    ) {
      const sourceAction = references.internals.actionCreatorDict[action.type];
      references.internals.listenerActionMap[action.type].forEach(
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
