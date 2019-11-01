import createReducer from './create-reducer';
import extractDataFromModel from './extract-data-from-model';

export default function createStoreInternals({
  disableImmer,
  initialState,
  injections,
  model,
  reducerEnhancer,
  references,
}) {
  const {
    actionCreatorDict,
    actionCreators,
    actionReducersDict,
    computedState,
    computedProperties,
    customReducers,
    defaultState,
    listenerActionCreators,
    listenerActionMap,
    persistenceConfig,
  } = extractDataFromModel(model, initialState, injections, references);

  const rootReducer = createReducer(
    disableImmer,
    actionReducersDict,
    customReducers,
    computedProperties,
  );

  return {
    actionCreatorDict,
    actionCreators,
    computedProperties,
    computedState,
    defaultState,
    listenerActionCreators,
    listenerActionMap,
    persistenceConfig,
    reducer: reducerEnhancer(rootReducer),
  };
}
