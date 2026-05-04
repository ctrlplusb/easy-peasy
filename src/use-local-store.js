import { useRef, useSyncExternalStore } from 'react';
import { useMemoOne } from './use-memo-one';
import { createStore } from './create-store';

export function useLocalStore(
  modelCreator,
  dependencies = [],
  configCreator = null,
) {
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

  const currentState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  );

  return [currentState, store.getActions(), store];
}
