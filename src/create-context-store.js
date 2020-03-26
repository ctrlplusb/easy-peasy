/* eslint-disable react/prop-types */

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useMemoOne } from 'use-memo-one';
import {
  createStoreActionsHook,
  createStoreDispatchHook,
  createStoreStateHook,
  createStoreRehydratedHook,
} from './hooks';
import createStore from './create-store';

export default function createContextStore(model, config = {}) {
  const StoreContext = createContext();

  function Provider({ children, initialData, ...dependencies }) {
    const previousStateRef = useRef(config.initialState);
    const initialDataRef = useRef(initialData);

    const store = useMemoOne(
      () =>
        createStore(
          typeof model === 'function' ? model(initialDataRef.current) : model,
          {
            ...config,
            injections: { ...config.injections, ...dependencies },
            initialState: previousStateRef.current,
          },
        ),
      [...Object.values(dependencies)],
    );

    useEffect(() => {
      return store.subscribe(() => {
        previousStateRef.current = store.getState();
      });
    }, [store]);

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
