import isPlainObject from 'is-plain-object';
import { modelSymbol, modelVisitorResults } from './constants';
import get from './lib/get';
import set from './lib/set';
import { bindListenerDefinitions } from './listeners';

export default function extractDataFromModel(model, initialState, references) {
  const actionCreatorDict = {};
  const actionCreators = {};
  const listenerActionCreators = {};
  const listenerActionMap = {};
  const listenerDefinitions = [];

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
      if (plugin.modelVisitor != null) {
        plugin.modelVisitor(current, key_, {
          key: key_,
          path,
          // TODO: parent & parentPath
        });
      }
    });

    const modelProperties = Object.keys(current);

    for (const key of modelProperties) {
      // This is the model marker key that we should strip/ignore
      if (key === modelSymbol) {
        continue;
      }

      const value = current[key];
      const propPath = [...path, key];

      // Check if this property is a model definition, if so we will recurse
      // into it
      if (isPlainObject(value) && value[modelSymbol]) {
        const existing = get(propPath, initialState);
        if (existing == null) {
          set(propPath, initialState, {});
        }
        recursiveExtractFromModel(value, propPath);
        continue;
      }

      let handled = false;
      for (const plugin of references.plugins) {
        const visitResult = plugin.modelVisitor(
          value,
          key,
          {
            key,
            parent: get(path, initialState),
            parentPath: path,
            path: propPath,
          },
          // TODO: Replace this with a set of APIs instead.
          // e.g. registerActionCreator
          {
            actionCreatorDict,
            actionCreators,
            listenerActionCreators,
            listenerDefinitions,
          },
        );
        if (visitResult === modelVisitorResults.CONTINUE) {
          handled = true;
          break;
        }
      }
      if (handled) {
        continue;
      }

      // This value is considered as being "state"
      const initialParentRef = get(path, initialState);
      if (initialParentRef && key in initialParentRef) {
        set(propPath, initialState, initialParentRef[key]);
      } else {
        set(propPath, initialState, value);
      }
    }
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
    defaultState: initialState,
    listenerActionCreators,
    listenerActionMap,
  };
}
