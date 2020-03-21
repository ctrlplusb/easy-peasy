import { useEffect, useRef, useState } from 'react';
import { useMemoOne } from 'use-memo-one';
import createStore from './create-store';

export default function useLocalStore(modelCreator, dependencies = [], config) {
  const store = useMemoOne(
    () => createStore(modelCreator(), config),
    dependencies,
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
}
