import { useMemo, useState, useRef, useEffect } from 'react';
import createStore from './create-store';

/**
 * Some good references on the topic of reinitialisation:
 * - https://github.com/facebook/react/issues/14830
 */

export default function createComponentStore(model, config) {
  return function useLocalStore(initialData) {
    const store = useMemo(
      () =>
        createStore(
          typeof model === 'function' ? model(initialData) : model,
          config,
        ),
      [],
    );
    const storeRef = useRef(store);
    const previousStateRef = useRef(store.getState());
    const [currentState, setCurrentState] = useState(() => store.getState());
    useEffect(() => {
      if (storeRef.current !== store) {
        storeRef.current = store;
        previousStateRef.current = store.getState();
        setCurrentState(previousStateRef.current);
      }
      return store.subscribe(() => {
        const nextState = store.getState();
        if (previousStateRef.current !== nextState) {
          previousStateRef.current = nextState;
          setCurrentState(nextState);
        }
      });
    }, [store]);
    return [currentState, store.dispatch];
  };
}
