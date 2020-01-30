import isPlainObject from 'is-plain-object';
import { modelSymbol, modelVisitorResults } from '../constants';
import get from '../lib/get';
import set from '../lib/set';

export default function parseModel(model, initialState, references) {
  function recursiveParseModel(current, path, key_) {
    current[modelSymbol] = current[modelSymbol] || {};

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
        recursiveParseModel(value, propPath);
        continue;
      }

      let handled = false;
      for (const plugin of references.plugins) {
        if (plugin.modelVisitor != null) {
          const visitResult = plugin.modelVisitor(value, key, {
            key,
            parent: get(path, initialState),
            parentPath: path,
            path: propPath,
          });
          if (visitResult === modelVisitorResults.CONTINUE) {
            handled = true;
            break;
          }
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

  recursiveParseModel(model, []);

  if (process.env.NODE_ENV !== 'production') {
    // TODO: Perform an analysis to see if there are any thunks/actions declared
    // on the state. This would mean that the nested models were not wrapped by
    // the model helper and that we should warn the user appropriately
  }

  return initialState;
}
