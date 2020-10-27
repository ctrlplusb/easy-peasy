import {
  actionOnSymbol,
  actionSymbol,
  computedSymbol,
  effectOnSymbol,
  persistSymbol,
  reducerSymbol,
  thunkOnSymbol,
  thunkSymbol,
} from './constants';
import { get, isPlainObject, set } from './lib';
import { extractPersistConfig } from './persistence';
import { createActionCreator } from './actions';
import { createThunkHandler, createThunkActionsCreator } from './thunks';
import { bindListenerDefinitions } from './listeners';
import { createComputedPropertyBinder } from './computed-properties';
import { createEffectHandler, createEffectActionsCreator } from './effects';

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
  const _effects = [];
  const _listenerActionCreators = {};
  const _listenerActionMap = {};
  const listenerDefinitions = [];
  let _persistenceConfig = [];
  const _computedState = {
    isInReducer: false,
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

      if (value != null && typeof value === 'object') {
        if (value[actionSymbol] || value[actionOnSymbol]) {
          const definition = { ...value };

          // Determine the category of the action
          const category = definition[actionSymbol] ? '@action' : '@actionOn';

          // Establish the meta data describing the action
          definition.meta = {
            actionName: meta.key,
            category,
            type: `${category}.${meta.path.join('.')}`,
            parent: meta.parent,
            path: meta.path,
          };

          // Create the "action creator" function
          definition.actionCreator = createActionCreator(
            definition,
            references,
          );

          // Create a bidirectional relationship of the definition/actionCreator
          definition.actionCreator.definition = definition;

          // Create a bidirectional relationship of the definition/reducer
          definition.fn.definition = definition;

          // Add the action creator to lookup map
          _actionCreatorDict[definition.meta.type] = definition.actionCreator;

          // Add the reducer to lookup map
          _actionReducersDict[definition.meta.type] = definition.fn;

          // We don't want to expose the internal action to consumers
          if (meta.key !== 'ePRS') {
            // Set the action creator in the "actions" object tree for
            // either the listeners object tree, or the standard actions/thunks
            // object tree
            if (definition[actionOnSymbol]) {
              listenerDefinitions.push(definition);
              set(path, _listenerActionCreators, definition.actionCreator);
            } else {
              set(path, _actionCreators, definition.actionCreator);
            }
          }
        } else if (value[thunkSymbol] || value[thunkOnSymbol]) {
          const definition = { ...value };

          // Determine the category of the thunk
          const category = definition[thunkSymbol] ? '@thunk' : '@thunkOn';

          // Establish the meta data describing the thunk
          const type = `${category}.${meta.path.join('.')}`;
          definition.meta = {
            actionName: meta.key,
            parent: meta.parent,
            path: meta.path,
            type,
            startType: `${type}(start)`,
            successType: `${type}(success)`,
            failType: `${type}(fail)`,
          };

          // Create the function that will handle, i.e. be executed, when
          // the thunk action is created/dispatched
          definition.thunkHandler = createThunkHandler(
            definition,
            references,
            injections,
            _actionCreators,
          );

          // Register the thunk handler
          set(path, actionThunks, definition.thunkHandler);

          // Create the "action creator" function
          definition.actionCreator = createThunkActionsCreator(
            definition,
            references,
          );

          // Create a bidirectional relationship of the definition/actionCreator
          definition.actionCreator.definition = definition;

          // Register the action creator within the lookup map
          _actionCreatorDict[definition.meta.type] = definition.actionCreator;

          // Set the action creator in the "actions" object tree for
          // either the listeners object tree, or the standard actions/thunks
          // object tree
          if (definition[thunkOnSymbol]) {
            listenerDefinitions.push(definition);
            set(path, _listenerActionCreators, definition.actionCreator);
          } else {
            set(path, _actionCreators, definition.actionCreator);
          }
        } else if (value[computedSymbol]) {
          const parent = get(parentPath, _defaultState);
          const bindComputedProperty = createComputedPropertyBinder(
            parentPath,
            key,
            value,
            references,
          );
          bindComputedProperty(parent, _defaultState);
          _computedProperties.push({ key, parentPath, bindComputedProperty });
        } else if (value[reducerSymbol]) {
          _customReducers.push({ key, parentPath, reducer: value.fn });
        } else if (value[effectOnSymbol]) {
          const definition = { ...value };

          // Establish the meta data describing the effect
          const type = `@effectOn.${meta.path.join('.')}`;
          definition.meta = {
            type,
            actionName: meta.key,
            parent: meta.parent,
            path: meta.path,
            startType: `${type}(start)`,
            successType: `${type}(success)`,
            failType: `${type}(fail)`,
          };

          const effectHandler = createEffectHandler(
            definition,
            references,
            injections,
            _actionCreators,
          );

          const actionCreator = createEffectActionsCreator(
            definition,
            references,
            effectHandler,
          );

          definition.actionCreator = actionCreator;

          _effects.push(definition);
        } else if (isPlainObject(value)) {
          const existing = get(path, _defaultState);
          if (existing == null) {
            set(path, _defaultState, {});
          }
          recursiveExtractFromModel(value, path);
        } else {
          handleValueAsState();
        }
      } else {
        handleValueAsState();
      }
    });

  _persistenceConfig = _persistenceConfig.sort((a, b) => {
    const aPath = a.path.join('.');
    const bPath = b.path.join('.');
    if (aPath < bPath) {
      return -1;
    }
    if (aPath > bPath) {
      return 1;
    }
    return 0;
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
    _effects,
    _listenerActionCreators,
    _listenerActionMap,
    _persistenceConfig,
  };
}
