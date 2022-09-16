import { useContext, useDebugValue, useEffect, useState } from 'react';
import EasyPeasyContext from './context';

const useNotInitialized = () => {
  throw new Error('uSES not initialized!');
};
let useSyncExternalStoreWithSelector = useNotInitialized;
export const initializeUseStoreState = (fn) => {
  useSyncExternalStoreWithSelector = fn;
};

const refEquality = (a, b) => a === b;

export function createStoreStateHook(Context) {
  return function useStoreState(mapState, equalityFn = refEquality) {
    if (process.env.NODE_ENV !== 'production') {
      if (!mapState) {
        throw new Error(`You must pass a selector to useStoreState`);
      }
      if (typeof mapState !== 'function') {
        throw new Error(
          `You must pass a function as a selector to useStoreState`,
        );
      }
      if (typeof equalityFn !== 'function') {
        throw new Error(
          `You must pass a function as an equality function to useStoreState`,
        );
      }
    }

    const store = useContext(Context);

    /*
    function useSyncExternalStoreWithSelector<Snapshot, Selection>(
        subscribe: (onStoreChange: () => void) => () => void,
        getSnapshot: () => Snapshot,
        getServerSnapshot: undefined | null | (() => Snapshot),
        selector: (snapshot: Snapshot) => Selection,
        isEqual?: (a: Selection, b: Selection) => boolean,
    ): Selection;
    */
    const selectedState = useSyncExternalStoreWithSelector(
      store.subscribe,
      store.getState,
      store.getState,
      mapState,
      equalityFn,
    );

    useDebugValue(selectedState);

    return selectedState;
  };
}

export const useStoreState = createStoreStateHook(EasyPeasyContext);

export function createStoreActionsHook(Context) {
  return function useStoreActions(mapActions) {
    const store = useContext(Context);
    return mapActions(store.getActions());
  };
}

export const useStoreActions = createStoreActionsHook(EasyPeasyContext);

export function createStoreDispatchHook(Context) {
  return function useStoreDispatch() {
    const store = useContext(Context);
    return store.dispatch;
  };
}

export const useStoreDispatch = createStoreDispatchHook(EasyPeasyContext);

export function useStore() {
  return useContext(EasyPeasyContext);
}

export function createStoreRehydratedHook(Context) {
  return function useStoreRehydrated() {
    const store = useContext(Context);
    const [rehydrated, setRehydrated] = useState(false);
    useEffect(() => {
      store.persist.resolveRehydration().then(() => setRehydrated(true));
    }, []);
    return rehydrated;
  };
}

export const useStoreRehydrated = createStoreRehydratedHook(EasyPeasyContext);

export function createTypedHooks() {
  return {
    useStoreActions,
    useStoreDispatch,
    useStoreState,
    useStoreRehydrated,
    useStore,
  };
}
