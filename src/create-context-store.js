/* eslint-disable react/prop-types */

import React, { createContext, useContext, useRef, useEffect } from 'react';
import produce from 'immer-peasy';
import merge from 'lodash.merge';
import {
  createStoreActionsHook,
  createStoreDispatchHook,
  createStoreStateHook,
  createStoreRehydratedHook,
} from './hooks';
import createStore from './create-store';

const shouldRecreateStoreOnInjectionsChange = (prevProps, currentProps) => {
  if (!prevProps && currentProps.config) return true;
  if (prevProps && prevProps.config && currentProps && currentProps.config) {
    const prevInjections = prevProps.config.injections || {};
    const currInjections = currentProps.config.injections || {};
    const mergedInjections = { ...currInjections, ...prevInjections };
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(mergedInjections)) {
      if (currInjections[key] !== mergedInjections[key]) return true;
    }
    return false;
  }
  return currentProps && currentProps.config;
};

export default function createContextStore(model, config = {}) {
  const StoreContext = createContext();

  function Provider({ children, initialData, ...props }) {
    const {
      config: runtimeConfig,
      shouldRecreateStore = shouldRecreateStoreOnInjectionsChange,
      configMergeStrategy = merge,
    } = props;

    const previousPropsRef = useRef();
    const storeRef = useRef();
    const previousStateRef = useRef();

    if (
      !storeRef.current ||
      shouldRecreateStore(previousPropsRef.current, props)
    ) {
      storeRef.current = createStore(
        typeof model === 'function' ? model(initialData) : model,
        produce(config, draft => {
          configMergeStrategy(draft, runtimeConfig);
          if (previousStateRef.current)
            draft.initialState = previousStateRef.current;
        }),
      );
    }

    previousPropsRef.current = props;

    useEffect(() => {
      return storeRef.current.subscribe(() => {
        previousStateRef.current = storeRef.current.getState();
      });
    }, [storeRef.current]);

    return (
      <StoreContext.Provider value={storeRef.current}>
        {children}
      </StoreContext.Provider>
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
