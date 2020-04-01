import { useMemo, useState, useRef, useEffect } from 'react';
import createStore from './create-store';

let notified = false;

/**
 * Some good references on the topic of reinitialisation:
 * - https://github.com/facebook/react/issues/14830
 */

export default function createComponentStore(model, config) {
  if (!notified) {
    notified = true;
    if (process.env.NODE_ENV === 'development') {
      console.log(`easy-peasy: Deprecation Warning.

You are using the createComponentStore API. This API has been deprecated and will be removed in the next major release.

We recommend that you instead use the newer useLocalStore API, which is a much more flexible and concise API:

    https://easy-peasy.now.sh/docs/api/use-local-store.html
`);
    }
  }

  return function useLocalStore(initialData) {
    const store = useMemo(
      () =>
        createStore(
          typeof model === 'function' ? model(initialData) : model,
          config,
        ),
      [],
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
