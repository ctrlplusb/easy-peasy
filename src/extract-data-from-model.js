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
  const defaultState = initialState;
  const actionCreatorDict = {};
  const actionCreators = {};
  const actionReducersDict = {};
  const actionThunks = {};
  const computedProperties = [];
  const customReducers = [];
  const listenerActionCreators = {};
  const listenerActionMap = {};
  const listenerDefinitions = [];
  const persistenceConfig = [];
  const computedState = {
    isInReducer: false,
    currentState: defaultState,
  };

  const recursiveExtractFromModel = (current, parentPath) =>
    Object.keys(current).forEach(key => {
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
          set(path, defaultState, initialParentRef[key]);
        } else {
          set(path, defaultState, value);
        }
      };

      if (key === persistSymbol) {
        persistenceConfig.push(extractPersistConfig(parentPath, value));
        return;
      }

      if (typeof value === 'function') {
        if (value[actionSymbol] || value[actionOnSymbol]) {
          const actionReducer = value;
          const actionCreator = createActionCreator(value, meta, references);
          actionCreatorDict[actionCreator.type] = actionCreator;
          actionReducersDict[actionCreator.type] = actionReducer;
          if (meta.key !== 'ePRS') {
            if (value[actionOnSymbol]) {
              listenerDefinitions.push(value);
              set(path, listenerActionCreators, actionCreator);
            } else {
              set(path, actionCreators, actionCreator);
            }
          }
        } else if (value[thunkSymbol] || value[thunkOnSymbol]) {
          const thunkHandler = createThunkHandler(
            value,
            meta,
            references,
            injections,
            actionCreators,
          );
          const actionCreator = createThunkActionsCreator(
            value,
            meta,
            references,
            thunkHandler,
          );
          set(path, actionThunks, thunkHandler);
          actionCreatorDict[actionCreator.type] = actionCreator;
          if (value[thunkOnSymbol]) {
            listenerDefinitions.push(value);
            set(path, listenerActionCreators, actionCreator);
          } else {
            set(path, actionCreators, actionCreator);
          }
        } else if (value[computedSymbol]) {
          const parent = get(parentPath, defaultState);
          const bindComputedProperty = createComputedPropertyBinder(
            parentPath,
            key,
            value,
            computedState,
            references,
          );
          bindComputedProperty(parent);
          computedProperties.push({ key, parentPath, bindComputedProperty });
        } else if (value[reducerSymbol]) {
          customReducers.push({ key, parentPath, reducer: value });
        } else {
          handleValueAsState();
        }
      } else if (isPlainObject(value)) {
        const existing = get(path, defaultState);
        if (existing == null) {
          set(path, defaultState, {});
        }
        recursiveExtractFromModel(value, path);
      } else {
        handleValueAsState();
      }
    });

  recursiveExtractFromModel(model, []);

  bindListenerDefinitions(
    listenerDefinitions,
    actionCreators,
    actionCreatorDict,
    listenerActionMap,
  );

  return {
    actionCreatorDict,
    actionCreators,
    actionReducersDict,
    computedProperties,
    customReducers,
    computedState,
    defaultState,
    listenerActionCreators,
    listenerActionMap,
    persistenceConfig,
  };
}
