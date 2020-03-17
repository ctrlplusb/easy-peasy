import {
  useContext,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import EasyPeasyContext from './context';

// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser. We need useLayoutEffect to ensure the store
// subscription callback always has the selector from the latest render commit
// available, otherwise a store update may happen between render and the effect,
// which may cause missed updates; we also must ensure the store subscription
// is created synchronously, otherwise a store update may occur before the
// subscription is created and an inconsistent state may be observed
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function createStoreStateHook(Context) {
  return function useStoreState(mapState, equalityFn) {
    const store = useContext(Context);
    const mapStateRef = useRef(mapState);
    const stateRef = useRef();
    const mountedRef = useRef(true);
    const subscriptionMapStateError = useRef();

    const [, forceRender] = useReducer(s => s + 1, 0);

    if (
      subscriptionMapStateError.current ||
      mapStateRef.current !== mapState ||
      stateRef.current === undefined
    ) {
      try {
        stateRef.current = mapState(store.getState());
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          let errorMessage = `An error occurred trying to map state in a useStoreState hook: ${err.message}.`;
          if (subscriptionMapStateError.current) {
            errorMessage += `\nThis error may be related to the following error:\n${subscriptionMapStateError.current.stack}\n\nOriginal stack trace:`;
          }
          throw new Error(errorMessage);
        }
        throw subscriptionMapStateError.current || err;
      }
    }

    useIsomorphicLayoutEffect(() => {
      mapStateRef.current = mapState;
      subscriptionMapStateError.current = undefined;
    });

    useIsomorphicLayoutEffect(() => {
      const checkMapState = () => {
        try {
          const newState = mapStateRef.current(store.getState());

          const isStateEqual =
            typeof equalityFn === 'function'
              ? equalityFn(stateRef.current, newState)
              : stateRef.current === newState;

          if (isStateEqual) {
            return;
          }

          stateRef.current = newState;
        } catch (err) {
          // see https://github.com/reduxjs/react-redux/issues/1179
          // There is a possibility mapState will fail due to stale state or
          // props, therefore we will just track the error and force our
          // component to update. It should then receive the updated state
          subscriptionMapStateError.current = err;
        }
        if (mountedRef.current) {
          forceRender({});
        }
      };
      const unsubscribe = store.subscribe(checkMapState);
      checkMapState();
      return () => {
        mountedRef.current = false;
        unsubscribe();
      };
    }, []);

    return stateRef.current;
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
