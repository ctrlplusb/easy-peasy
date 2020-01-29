import createReducer from './create-reducer';
import extractDataFromModel from './extract-data-from-model';

export default function createStoreInternals({
  disableImmer,
  initialState,
  model,
  reducerEnhancer,
  references,
}) {
  references.plugins.forEach(plugin => {
    if (plugin.onBeforeCreateStore != null) {
      plugin.onBeforeCreateStore({ initialState });
    }
  });

  const {
    actionCreatorDict,
    actionCreators,
    defaultState,
    listenerActionCreators,
    listenerActionMap,
    persistenceConfig,
  } = extractDataFromModel(model, initialState, references);

  const rootReducer = createReducer(disableImmer, references);

  return {
    actionCreatorDict,
    actionCreators,
    defaultState,
    listenerActionCreators,
    listenerActionMap,
    persistenceConfig,
    reducer: reducerEnhancer(rootReducer),
  };
}
