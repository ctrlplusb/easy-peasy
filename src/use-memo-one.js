import React from 'react';
import { areInputsEqual } from './lib';

export function useMemoOne(
  // getResult changes on every call,
  getResult,
  // the inputs array changes on every call
  inputs,
) {
  // using useState to generate initial value as it is lazy
  const initial = React.useState(() => ({
    inputs,
    result: getResult(),
  }))[0];

  const committed = React.useRef(initial);

  // persist any uncommitted changes after they have been committed

  const isInputMatch = Boolean(
    inputs &&
      committed.current.inputs &&
      areInputsEqual(inputs, committed.current.inputs),
  );

  // create a new cache if required
  const cache = isInputMatch
    ? committed.current
    : {
        inputs,
        result: getResult(),
      };

  // commit the cache
  React.useEffect(() => {
    committed.current = cache;
  }, [cache]);

  return cache.result;
}
