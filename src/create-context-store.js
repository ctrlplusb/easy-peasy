/* eslint-disable react/prop-types */

import React, { createContext, useContext } from 'react';
import { useMemoOne } from 'use-memo-one';
import {
  createStoreActionsHook,
  createStoreDispatchHook,
  createStoreStateHook,
  createStoreRehydratedHook,
} from './hooks';
import createStore from './create-store';

export default function createContextStore(model, config) {
  const StoreContext = createContext();

  function Provider({ children, initialData }) {
    const store = useMemoOne(
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

  function useStore() {
    return useContext(StoreContext);
  }

  return {
    Provider,
    useStore,
    useStoreState: createStoreStateHook(StoreContext),
    useStoreActions: createStoreActionsHook(StoreContext),
    useStoreDispatch: createStoreDispatchHook(StoreContext),
    useStoreRehydrated: createStoreRehydratedHook(StoreContext),
  };
}
