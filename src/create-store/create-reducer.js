import createSimpleProduce from '../lib/create-simple-produce';

export default function createReducer(disableImmer, references) {
  const simpleProduce = createSimpleProduce(disableImmer);
  return function reducer(state, action) {
    const nextState = references.plugins.reduce((prevState, plugin) => {
      if (plugin.reducer != null) {
        return plugin.reducer(prevState, action, { simpleProduce });
      }
      return prevState;
    }, state);
    if (state !== nextState) {
      references.plugins.forEach(plugin => {
        if (plugin.onReducerStateChanged != null) {
          plugin.onReducerStateChanged(state, nextState);
        }
      });
    }
    return nextState;
  };
}
