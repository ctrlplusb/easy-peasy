import { useState, useEffect, useContext, useRef, useMemo } from 'react';
import shallowEqual from 'shallowequal';
import EasyPeasyContext from './context';
import { isStateObject } from './lib';

let idx = 0;

export function useStore(mapState, dependencies = []) {
  const id = useMemo(() => {
    idx += 1;
    return idx;
  }, []);
  const { store, addListener, removeListener } = useContext(EasyPeasyContext);
  const [state, setState] = useState(mapState(store.getState()));
  // As our effect only fires on mount and unmount it won't have the state
  // changes visible to it, therefore we use a mutable ref to track this.
  const stateRef = useRef(state);
  // Helps avoid firing of events when unsubscribed, i.e. unmounted
  const isActive = useRef(true);
  useEffect(() => {
    const handleStoreUpdate = storeState => {
      const newState = mapState(storeState);
      if (
        newState === stateRef.current ||
        (isStateObject(newState) &&
          isStateObject(stateRef.current) &&
          shallowEqual(newState, stateRef.current))
      ) {
        // Do nothing
        return;
      }
      stateRef.current = newState;
      if (isActive.current) {
        setState(stateRef.current);
      }
    };
    isActive.current = true;
    handleStoreUpdate(store.getState());
    addListener(id, handleStoreUpdate);
    return () => {
      isActive.current = false;
      removeListener(id);
    };
  }, dependencies);
  return state;
}

export function useActions(mapActions) {
  const { store } = useContext(EasyPeasyContext);
  return mapActions(store.dispatch);
}

export function useDispatch() {
  const { store } = useContext(EasyPeasyContext);
  return store.dispatch;
}

export function createTypedHooks() {
  return {
    useActions,
    useDispatch,
    useStore,
  };
}
