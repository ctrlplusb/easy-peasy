/* eslint-disable react/prop-types */

import React, { createContext, useContext } from 'react';
import {
  createStoreActionsHook,
  createStoreDispatchHook,
  createStoreStateHook,
  createStoreRehydratedHook,
} from './hooks';
import { createStore } from './create-store';
import { useMemoOne } from './lib';

export function createContextStore(model, config = {}) {
  // We create a mutable injections reference to allow updating it
  const { injections: mutableInjections = {} } = config;

  const StoreContext = createContext();

  function Provider({ children, runtimeModel, injections }) {
    // If the user provided injections we need to ensure our mutable ref
    // is up to date. We could consider doing a shallow compare here?
    if (injections != null) {
      const nextInjections =
        typeof injections === 'function'
          ? injections(mutableInjections)
          : injections;
      const nextKeys = Object.keys(nextInjections);
      const removeKeys = Object.keys(mutableInjections).filter(
        (k) => !nextKeys.includes(k),
      );
      removeKeys.forEach((k) => {
        delete mutableInjections[k];
      });
      Object.assign(mutableInjections, nextInjections);
    }

    const store = useMemoOne(
      () =>
        createStore(typeof model === 'function' ? model(runtimeModel) : model, {
          ...config,
          originalInjections: mutableInjections,
        }),
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
