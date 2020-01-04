/* eslint-disable react/prop-types */

import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useEffect,
} from 'react';
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
    const previousStateRef = useRef();

    const store = useMemo(
      () =>
        createStore(
          typeof model === 'function'
            ? model(previousStateRef.current || initialDataRef.current)
            : model,
          produce(config, draft => {
            draft.injections = { ...draft.injections, ...injections };
          }),
        ),
      Object.values(injections),
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
