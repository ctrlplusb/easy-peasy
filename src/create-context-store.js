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
import { useShallowEqualMemo } from './lib';

export default function createContextStore(model, config = {}) {
  const StoreContext = createContext();

  function Provider({ children, initialData, injections }) {
    const previousStateRef = useRef(config.initialState);
    const initialDataRef = useRef(initialData);
    const injectionsMemo = useShallowEqualMemo(injections);

    const store = useMemoOne(
      () =>
        createStore(
          typeof model === 'function' ? model(initialDataRef.current) : model,
          {
            ...config,
            injections: { ...config.injections, ...injectionsMemo },
            initialState: previousStateRef.current,
          },
        ),
      [injectionsMemo],
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
