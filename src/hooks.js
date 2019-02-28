import { useState, useEffect, useContext, useRef } from 'react';
import shallowEqual from 'shallowequal';
import EasyPeasyContext from './context';
import { isStateObject } from './lib';

export function useStore(mapState, dependencies = []) {
  const store = useContext(EasyPeasyContext);
  const [state, setState] = useState(mapState(store.getState()));
  // As our effect only fires on mount and unmount it won't have the state
  // changes visible to it, therefore we use a mutable ref to track this.
  const stateRef = useRef(state);
  // Helps avoid firing of events when unsubscribed, i.e. unmounted
  const isActive = useRef(true);
  useEffect(() => {
    const calculateState = () => {
      const newState = mapState(store.getState());
      isActive.current = true;
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
    calculateState();
    const unsubscribe = store.subscribe(calculateState);
    return () => {
      unsubscribe();
      isActive.current = false;
    };
  }, dependencies);
  return state;
}

export function useActions(mapActions) {
  const store = useContext(EasyPeasyContext);
  return mapActions(store.dispatch);
}

export function useDispatch() {
  const store = useContext(EasyPeasyContext);
  return store.dispatch;
}

export function createTypedHooks() {
  return {
    useActions,
    useDispatch,
    useStore,
  };
}
