import createReducer from './create-reducer';
import parseModel from './parse-model';

export default function bindStoreInternals(
  model,
  options,
  references,
  initialState,
) {
  const { disableImmer, reducerEnhancer } = options;
  references.internals = {};
  references.internals.actionCreatorDict = {};
  references.internals.actionCreators = {};
  references.plugins.forEach(plugin => {
    if (plugin.onBeforeParseModel != null) {
      plugin.onBeforeParseModel({ initialState });
    }
  });
  references.internals.defaultState = parseModel(
    model,
    initialState,
    references,
  );
  references.internals.reducer = reducerEnhancer(
    createReducer(disableImmer, references),
  );
}
