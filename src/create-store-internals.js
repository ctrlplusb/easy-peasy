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
    _actionCreatorDict,
    _actionCreators,
    _actionReducersDict,
    _computedState,
    _computedProperties,
    _customReducers,
    _defaultState,
    _listenerActionCreators,
    _listenerActionMap,
    _persistenceConfig,
  } = extractDataFromModel(model, initialState, injections, references);

  const rootReducer = createReducer(
    disableImmer,
    _actionReducersDict,
    _customReducers,
    _computedProperties,
  );

  return {
    _actionCreatorDict,
    _actionCreators,
    _computedProperties,
    _computedState,
    _defaultState,
    _listenerActionCreators,
    _listenerActionMap,
    _persistenceConfig,
    reducer: reducerEnhancer(rootReducer),
  };
}
