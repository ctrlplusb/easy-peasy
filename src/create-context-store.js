/* eslint-disable react/prop-types */

import React, { createContext, useMemo } from 'react';
import {
  createStoreActionsHook,
  createStoreDispatchHook,
  createStoreStateHook,
  createStoreHook,
  createStoreModelHook,
  createStoreRehydratedHook,
} from './hooks';
import createStore from './create-store';

export default function createContextStore(model, config) {
  const StoreContext = createContext();

  function Provider({ children, initialData }) {
    const store = useMemo(
      () =>
        createStore(
          typeof model === 'function' ? model(initialData) : model,
          config,
        ),
      [],
    );
    return (
      <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    );
  }

  return {
    Provider,
    useStore: createStoreHook(StoreContext),
    useStoreState: createStoreStateHook(StoreContext),
    useStoreActions: createStoreActionsHook(StoreContext),
    useStoreDispatch: createStoreDispatchHook(StoreContext),
    useStoreRehydrated: createStoreRehydratedHook(StoreContext),
    useStoreModel: createStoreModelHook(StoreContext),
  };
}
