/* eslint-disable react/prop-types */

import React, { createContext, useContext, useMemo, useRef } from 'react';
import produce from 'immer-peasy';
import {
  createStoreActionsHook,
  createStoreDispatchHook,
  createStoreStateHook,
  createStoreRehydratedHook,
} from './hooks';
import createStore from './create-store';

export default function createContextStore(model, config = {}) {
  const StoreContext = createContext();

  function Provider({ children, initialData, ...injections }) {
    const initialDataRef = useRef(initialData);

    const store = useMemo(
      () =>
        createStore(
          typeof model === 'function' ? model(initialDataRef.current) : model,
          produce(config, draft => {
            draft.injections = { ...draft.injections, ...injections };
          }),
        ),
      [initialDataRef, ...Object.values(injections)],
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
