import {
  use,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useSyncExternalStore,
  useTransition,
} from 'react';
import EasyPeasyContext from './context';

const refEquality = (a, b) => a === b;

function useSyncExternalStoreWithSelector(
  subscribe,
  getSnapshot,
  getServerSnapshot,
  selector,
  isEqual,
) {
  const instRef = useRef(null);
  let inst;
  if (instRef.current === null) {
    inst = { hasValue: false, value: null };
    instRef.current = inst;
  } else {
    inst = instRef.current;
  }

  const [getSelection, getServerSelection] = useMemo(() => {
    let hasMemo = false;
    let memoizedSnapshot;
    let memoizedSelection;
    const memoizedSelector = (nextSnapshot) => {
      if (!hasMemo) {
        hasMemo = true;
        memoizedSnapshot = nextSnapshot;
        const nextSelection = selector(nextSnapshot);
        if (isEqual !== undefined && inst.hasValue) {
          const currentSelection = inst.value;
          if (isEqual(currentSelection, nextSelection)) {
            memoizedSelection = currentSelection;
            return currentSelection;
          }
        }
        memoizedSelection = nextSelection;
        return nextSelection;
      }

      const prevSnapshot = memoizedSnapshot;
      const prevSelection = memoizedSelection;

      if (Object.is(prevSnapshot, nextSnapshot)) {
        return prevSelection;
      }

      const nextSelection = selector(nextSnapshot);

      if (isEqual !== undefined && isEqual(prevSelection, nextSelection)) {
        memoizedSnapshot = nextSnapshot;
        return prevSelection;
      }

      memoizedSnapshot = nextSnapshot;
      memoizedSelection = nextSelection;
      return nextSelection;
    };

    const getSnapshotWithSelector = () => memoizedSelector(getSnapshot());
    const getServerSnapshotWithSelector =
      getServerSnapshot == null
        ? undefined
        : () => memoizedSelector(getServerSnapshot());

    return [getSnapshotWithSelector, getServerSnapshotWithSelector];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSnapshot, getServerSnapshot, selector, isEqual]);

  const value = useSyncExternalStore(
    subscribe,
    getSelection,
    getServerSelection,
  );

  useEffect(() => {
    inst.hasValue = true;
    inst.value = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return value;
}

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

function wrapInTransition(target, startTransition) {
  if (typeof target === 'function') {
    return (...args) => {
      let result;
      startTransition(() => {
        result = target(...args);
      });
      return result;
    };
  }
  if (target !== null && typeof target === 'object') {
    const wrapped = {};
    for (const key of Object.keys(target)) {
      wrapped[key] = wrapInTransition(target[key], startTransition);
    }
    return wrapped;
  }
  return target;
}

export function createStoreTransitionHook(Context) {
  return function useStoreTransition(mapActions) {
    const store = useContext(Context);
    const [isPending, startTransition] = useTransition();
    const actions = mapActions(store.getActions());
    const wrappedActions = useMemo(
      () => wrapInTransition(actions, startTransition),
      [actions, startTransition],
    );
    return [wrappedActions, isPending];
  };
}

export const useStoreTransition = createStoreTransitionHook(EasyPeasyContext);

export function createStoreDeferredStateHook(Context) {
  const useStoreStateForContext = createStoreStateHook(Context);
  return function useStoreDeferredState(mapState, equalityFn) {
    const value = useStoreStateForContext(mapState, equalityFn);
    return useDeferredValue(value);
  };
}

export const useStoreDeferredState =
  createStoreDeferredStateHook(EasyPeasyContext);

export function createStoreOptimisticHook(Context) {
  const useStoreStateForContext = createStoreStateHook(Context);
  return function useStoreOptimistic(mapState, updateFn) {
    const value = useStoreStateForContext(mapState);
    return useOptimistic(value, updateFn);
  };
}

export const useStoreOptimistic =
  createStoreOptimisticHook(EasyPeasyContext);

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
    use(store.persist.resolveRehydration());
    return true;
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
    useStoreTransition,
    useStoreDeferredState,
    useStoreOptimistic,
  };
}
