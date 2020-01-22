import isPlainObject from 'is-plain-object';
import {
  actionOnSymbol,
  actionSymbol,
  computedSymbol,
  modelSymbol,
  reducerSymbol,
  thunkOnSymbol,
  thunkSymbol,
} from './constants';
import { get, set } from './lib';
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
  const actionCreatorDict = {};
  const actionCreators = {};
  const actionReducersDict = {};
  const actionThunks = {};
  const computedProperties = [];
  const customReducers = [];
  const listenerActionCreators = {};
  const listenerActionMap = {};
  const listenerDefinitions = [];
  const computedState = {
    isInReducer: false,
    currentState: initialState,
  };

  function recursiveExtractFromModel(current, path, key_) {
    if (current[modelSymbol] == null) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          'Model provided to store is not wrapped by the "model" helper. It is implicitly considered to be a model.',
        );
      }
      current[modelSymbol] = {};
    }

    references.plugins.forEach(plugin => {
      plugin.modelVisitor(current, key_, {
        path,
      });
    });

    Object.keys(current).forEach(key => {
      if (key === modelSymbol) {
        return;
      }

      const value = current[key];
      const propPath = [...path, key];
      const meta = {
        parent: path,
        path: propPath,
        key,
      };
      const handleValueAsState = () => {
        const initialParentRef = get(path, initialState);
        if (initialParentRef && key in initialParentRef) {
          set(propPath, initialState, initialParentRef[key]);
        } else {
          set(propPath, initialState, value);
        }
      };

      if (typeof value === 'function') {
        if (value[actionSymbol] || value[actionOnSymbol]) {
          const actionReducer = value;
          const actionCreator = createActionCreator(value, meta, references);
          actionCreatorDict[actionCreator.type] = actionCreator;
          actionReducersDict[actionCreator.type] = actionReducer;
          if (meta.key !== 'ePRS') {
            if (value[actionOnSymbol]) {
              listenerDefinitions.push(value);
              set(propPath, listenerActionCreators, actionCreator);
            } else {
              set(propPath, actionCreators, actionCreator);
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
          set(propPath, actionThunks, thunkHandler);
          actionCreatorDict[actionCreator.type] = actionCreator;
          if (value[thunkOnSymbol]) {
            listenerDefinitions.push(value);
            set(propPath, listenerActionCreators, actionCreator);
          } else {
            set(propPath, actionCreators, actionCreator);
          }
        } else if (value[computedSymbol]) {
          const parent = get(path, initialState);
          const bindComputedProperty = createComputedPropertyBinder(
            path,
            key,
            value,
            computedState,
            references,
          );
          bindComputedProperty(parent);
          computedProperties.push({
            key,
            parentPath: path,
            bindComputedProperty,
          });
        } else if (value[reducerSymbol]) {
          customReducers.push({ key, parentPath: path, reducer: value });
        } else {
          handleValueAsState();
        }
      } else if (isPlainObject(value)) {
        if (value[modelSymbol]) {
          const existing = get(propPath, initialState);
          if (existing == null) {
            set(propPath, initialState, {});
          }
          recursiveExtractFromModel(value, propPath);
        } else {
          handleValueAsState();
        }
      } else {
        handleValueAsState();
      }
    });
  }

  recursiveExtractFromModel(model, []);

  bindListenerDefinitions(
    listenerDefinitions,
    actionCreators,
    actionCreatorDict,
    listenerActionMap,
  );

  if (process.env.NODE_ENV !== 'production') {
    // TODO: Perform an analysis to see if there are any thunks/actions declared
    // on the state. This would mean that the nested models were not wrapped by
    // the model helper and that we should warn the user appropriately
  }

  return {
    actionCreatorDict,
    actionCreators,
    actionReducersDict,
    computedProperties,
    customReducers,
    computedState,
    defaultState: initialState,
    listenerActionCreators,
    listenerActionMap,
  };
}
