import isPlainObject from 'is-plain-object';
import {
  actionOnSymbol,
  actionSymbol,
  computedSymbol,
  persistSymbol,
  reducerSymbol,
  thunkOnSymbol,
  thunkSymbol,
} from './constants';
import { get, set } from './lib';
import { extractPersistConfig } from './persistence';
import { createActionCreator } from './actions';
import { createThunkHandler, createThunkActionsCreator } from './thunks';
import { bindListenerDefinitions } from './listeners';
import { createComputedPropertyBinder } from './computed-properties';

export default function extractDataFromModel(
  model,
  initialState,
  injections,
  references,
) {
  const _defaultState = initialState;
  const _actionCreatorDict = {};
  const _actionCreators = {};
  const _actionReducersDict = {};
  const actionThunks = {};
  const _computedProperties = [];
  const _customReducers = [];
  const _listenerActionCreators = {};
  const _listenerActionMap = {};
  const listenerDefinitions = [];
  const _persistenceConfig = [];
  const _computedState = {
    isInReducer: false,
    currentState: _defaultState,
  };

  const recursiveExtractFromModel = (current, parentPath) =>
    Object.keys(current).forEach((key) => {
      const value = current[key];
      const path = [...parentPath, key];
      const meta = {
        parent: parentPath,
        path,
        key,
      };
      const handleValueAsState = () => {
        const initialParentRef = get(parentPath, initialState);
        if (initialParentRef && key in initialParentRef) {
          set(path, _defaultState, initialParentRef[key]);
        } else {
          set(path, _defaultState, value);
        }
      };

      if (key === persistSymbol) {
        _persistenceConfig.push(extractPersistConfig(parentPath, value));
        return;
      }

      if (typeof value === 'function') {
        if (value[actionSymbol] || value[actionOnSymbol]) {
          const actionReducer = value;
          const actionCreator = createActionCreator(value, meta, references);
          _actionCreatorDict[actionCreator.type] = actionCreator;
          _actionReducersDict[actionCreator.type] = actionReducer;
          if (meta.key !== 'ePRS') {
            if (value[actionOnSymbol]) {
              listenerDefinitions.push(value);
              set(path, _listenerActionCreators, actionCreator);
            } else {
              set(path, _actionCreators, actionCreator);
            }
          }
        } else if (value[thunkSymbol] || value[thunkOnSymbol]) {
          const thunkHandler = createThunkHandler(
            value,
            meta,
            references,
            injections,
            _actionCreators,
          );
          const actionCreator = createThunkActionsCreator(
            value,
            meta,
            references,
            thunkHandler,
          );
          set(path, actionThunks, thunkHandler);
          _actionCreatorDict[actionCreator.type] = actionCreator;
          if (value[thunkOnSymbol]) {
            listenerDefinitions.push(value);
            set(path, _listenerActionCreators, actionCreator);
          } else {
            set(path, _actionCreators, actionCreator);
          }
        } else if (value[computedSymbol]) {
          const parent = get(parentPath, _defaultState);
          const bindComputedProperty = createComputedPropertyBinder(
            parentPath,
            key,
            value,
            _computedState,
            references,
          );
          bindComputedProperty(parent);
          _computedProperties.push({ key, parentPath, bindComputedProperty });
        } else if (value[reducerSymbol]) {
          _customReducers.push({ key, parentPath, reducer: value });
        } else {
          handleValueAsState();
        }
      } else if (isPlainObject(value)) {
        const existing = get(path, _defaultState);
        if (existing == null) {
          set(path, _defaultState, {});
        }
        recursiveExtractFromModel(value, path);
      } else {
        handleValueAsState();
      }
    });

  recursiveExtractFromModel(model, []);

  bindListenerDefinitions(
    listenerDefinitions,
    _actionCreators,
    _actionCreatorDict,
    _listenerActionMap,
  );

  return {
    _actionCreatorDict,
    _actionCreators,
    _actionReducersDict,
    _computedProperties,
    _customReducers,
    _computedState,
    _defaultState,
    _listenerActionCreators,
    _listenerActionMap,
    _persistenceConfig,
  };
}
