/* eslint-disable react/prop-types */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  createStoreActionsHook,
  createStoreDispatchHook,
  createStoreStateHook,
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

  function useStore() {
    return useContext(StoreContext);
  }

  return {
    Provider,
    useStore,
    useState: createStoreStateHook(StoreContext),
    useActions: createStoreActionsHook(StoreContext),
    useDispatch: createStoreDispatchHook(StoreContext),
  };
}
