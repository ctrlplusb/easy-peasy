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

export default function createContainerStore(model, config) {
  const StoreContext = createContext();

  function Provider({ children, initialState }) {
    const store = useMemo(
      () =>
        createStore(
          typeof model === 'function' ? model(initialState) : model,
          config,
        ),
      [],
    );
    return (
      <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    );
  }

  function useStore() {
    const store = useContext(StoreContext);
    const previousStateRef = useRef(store.getState());
    const [currentState, setCurrentState] = useState(() => store.getState());
    useEffect(() => {
      return store.subscribe(() => {
        const nextState = store.getState();
        if (previousStateRef.current !== nextState) {
          previousStateRef.current = nextState;
          setCurrentState(nextState);
        }
      });
    }, []);
    return [currentState, store.dispatch];
  }

  return {
    Provider,
    useStore,
    useState: createStoreStateHook(StoreContext),
    useActions: createStoreActionsHook(StoreContext),
    useDispatch: createStoreDispatchHook(StoreContext),
  };
}
