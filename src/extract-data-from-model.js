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
import { bindListenerdefs } from './listeners';
import { createComputedPropertyBinder } from './computed-properties';
import { createEffectHandler, createEffectActionsCreator } from './effects';

export default function extractDataFromModel(
  model,
  initialState,
  injections,
  _r,
) {
  const _dS = initialState;
  const _aCD = {};
  const _aC = {};
  const _aRD = {};
  const actionThunks = {};
  const _cP = [];
  const _cR = [];
  const _e = [];
  const _lAC = {};
  const _lAM = {};
  const listenerdefs = [];
  let _persistenceConfig = [];
  const _cS = {
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
          set(path, _dS, initialParentRef[key]);
        } else {
          set(path, _dS, value);
        }
      };

      if (key === persistSymbol) {
        _persistenceConfig.push(extractPersistConfig(parentPath, value));
        return;
      }

      if (value != null && typeof value === 'object') {
        if (value[actionSymbol] || value[actionOnSymbol]) {
          const def = { ...value };

          // Determine the category of the action
          const category = def[actionSymbol] ? '@action' : '@actionOn';

          // Establish the meta data describing the action
          def.meta = {
            actionName: meta.key,
            category,
            type: `${category}.${meta.path.join('.')}`,
            parent: meta.parent,
            path: meta.path,
          };

          // Create the "action creator" function
          def.actionCreator = createActionCreator(def, _r);

          // Create a bidirectional relationship of the def/actionCreator
          def.actionCreator.def = def;

          // Create a bidirectional relationship of the def/reducer
          def.fn.def = def;

          // Add the action creator to lookup map
          _aCD[def.meta.type] = def.actionCreator;

          // Add the reducer to lookup map
          _aRD[def.meta.type] = def.fn;

          // We don't want to expose the internal action to consumers
          if (meta.key !== 'ePRS') {
            // Set the action creator in the "actions" object tree for
            // either the listeners object tree, or the standard actions/thunks
            // object tree
            if (def[actionOnSymbol]) {
              listenerdefs.push(def);
              set(path, _lAC, def.actionCreator);
            } else {
              set(path, _aC, def.actionCreator);
            }
          }
        } else if (value[thunkSymbol] || value[thunkOnSymbol]) {
          const def = { ...value };

          // Determine the category of the thunk
          const category = def[thunkSymbol] ? '@thunk' : '@thunkOn';

          // Establish the meta data describing the thunk
          const type = `${category}.${meta.path.join('.')}`;
          def.meta = {
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
          def.thunkHandler = createThunkHandler(def, _r, injections, _aC);

          // Register the thunk handler
          set(path, actionThunks, def.thunkHandler);

          // Create the "action creator" function
          def.actionCreator = createThunkActionsCreator(def, _r);

          // Create a bidirectional relationship of the def/actionCreator
          def.actionCreator.def = def;

          // Register the action creator within the lookup map
          _aCD[def.meta.type] = def.actionCreator;

          // Set the action creator in the "actions" object tree for
          // either the listeners object tree, or the standard actions/thunks
          // object tree
          if (def[thunkOnSymbol]) {
            listenerdefs.push(def);
            set(path, _lAC, def.actionCreator);
          } else {
            set(path, _aC, def.actionCreator);
          }
        } else if (value[computedSymbol]) {
          const parent = get(parentPath, _dS);
          const bindComputedProperty = createComputedPropertyBinder(
            parentPath,
            key,
            value,
            _r,
          );
          bindComputedProperty(parent, _dS);
          _cP.push({ key, parentPath, bindComputedProperty });
        } else if (value[reducerSymbol]) {
          _cR.push({ key, parentPath, reducer: value.fn });
        } else if (value[effectOnSymbol]) {
          const def = { ...value };

          // Establish the meta data describing the effect
          const type = `@effectOn.${meta.path.join('.')}`;
          def.meta = {
            type,
            actionName: meta.key,
            parent: meta.parent,
            path: meta.path,
            startType: `${type}(start)`,
            successType: `${type}(success)`,
            failType: `${type}(fail)`,
          };

          const effectHandler = createEffectHandler(def, _r, injections, _aC);

          const actionCreator = createEffectActionsCreator(
            def,
            _r,
            effectHandler,
          );

          def.actionCreator = actionCreator;

          _e.push(def);
        } else if (isPlainObject(value)) {
          const existing = get(path, _dS);
          if (existing == null) {
            set(path, _dS, {});
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

  bindListenerdefs(listenerdefs, _aC, _aCD, _lAM);

  return {
    _aCD,
    _aC,
    _aRD,
    _cP,
    _cR,
    _cS,
    _dS,
    _e,
    _lAC,
    _lAM,
    _persistenceConfig,
  };
}
