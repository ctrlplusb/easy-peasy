import { useState, useEffect, useContext, useRef } from 'react';
import shallowEqual from 'shallowequal';
import EasyPeasyContext from './context';
import { isStateObject } from './lib';

export function useStore(mapState, dependencies = []) {
  const store = useContext(EasyPeasyContext);
  const [state, setState] = useState(() => mapState(store.getState()));
  const [error, setError] = useState(null);
  // As our effect only fires on mount and unmount it won't have the state
  // changes visible to it, therefore we use a mutable ref to track this.
  const stateRef = useRef(state);
  // Helps avoid firing of events when unsubscribed, i.e. unmounted
  const isActive = useRef(true);
  // Tracks when a hooked component is unmounting
  const unmounted = useRef(false);
  // Throwing the error inline allows error boundaries the opportunity to
  // catch the error
  if (error) {
    throw error;
  }
  useEffect(() => {
    isActive.current = true;
    const calculateState = () => {
      if (!isActive.current) {
        return;
      }
      try {
        const newState = mapState(store.getState());
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
        setState(() => stateRef.current);
      } catch (err) {
        // see https://github.com/reduxjs/react-redux/issues/1179
        // There is a possibility mapState will fail as the props/state that
        // the component has received is stale. Therefore we will afford the
        // application a small window of opportunity, where if they unmount
        // the component or provide it with new "valid" props (which will
        // subsequently cause a refreshed subscription cycle) then we will not
        // throw an error.
        // This is by no means a robust solution. We should track the
        // associated issue in the hope for a more dependable solution.

        // Setting the listener as "inactive", this can only be changed if the
        // incoming dependencies are different (i.e. props have changed)
        isActive.current = false;

        setTimeout(() => {
          if (!unmounted.current && !isActive.current) {
            setError(err);
          }
        }, 200); // give a window of opportunity
      }
    };
    calculateState();
    const unsubscribe = store.subscribe(calculateState);
    return () => {
      isActive.current = false;
      unsubscribe();
    };
  }, dependencies);

  // This effect will set the ref value to indicate that the component has
  // unmounted
  useEffect(() => {
    return () => {
      unmounted.current = true;
    };
  }, []);
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
