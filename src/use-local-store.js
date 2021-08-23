import { useEffect, useRef, useState } from 'react';
import { useMemoOne } from './lib';
import { createStore } from './create-store';

export function useLocalStore(modelCreator, dependencies = [], configCreator) {
  const storeRef = useRef();

  const configRef = useRef();

  const store = useMemoOne(() => {
    const previousState =
      storeRef.current != null ? storeRef.current.getState() : undefined;
    const config =
      configCreator != null
        ? configCreator(previousState, configRef.current)
        : undefined;
    const _store = createStore(modelCreator(previousState), config);
    configRef.current = config;
    storeRef.current = _store;
    return _store;
  }, dependencies);

  const [currentState, setCurrentState] = useState(() => store.getState());

  useEffect(
    () => {
      setCurrentState(store.getState());
      store.subscribe(() => {
        const nextState = store.getState();
        if (currentState !== nextState) {
          setCurrentState(nextState);
        }
      });
    },
    [store],
  );

  return [currentState, store.getActions(), store];
}
