import { useMemo, useState, useRef, useEffect } from 'react';
import produce from 'immer-peasy';
import createStore from './create-store';

/**
 * Some good references on the topic of reinitialisation:
 * - https://github.com/facebook/react/issues/14830
 */

export default function createComponentStore(model, config = {}) {
  return function useLocalStore(initialData, injections = {}) {
    const initialDataRef = useRef(initialData);

    const store = useMemo(
      () =>
        createStore(
          typeof model === 'function' ? model(initialDataRef.current) : model,
          produce(config, draft => {
            draft.injections = { ...draft.injections, ...injections };
          }),
        ),
      [initialDataRef, ...Object.values(injections)],
    );
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
    }, [store]);
    return [currentState, store.getActions()];
  };
}
