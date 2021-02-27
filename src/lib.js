import React from 'react';
import { Immer, isDraft } from 'immer';

/**
 * We create our own immer instance to avoid potential issues with autoFreeze
 * becoming default enabled everywhere. We want to disable autofreeze as it
 * does not suit the design of Easy Peasy.
 * https://github.com/immerjs/immer/issues/681#issuecomment-705581111
 */
let easyPeasyImmer;

export function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false;

  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}

export function clone(source) {
  function recursiveClone(current) {
    const next = Object.keys(current).reduce((acc, key) => {
      if (Object.getOwnPropertyDescriptor(current, key).get == null) {
        acc[key] = current[key];
      }
      return acc;
    }, {});
    Object.keys(next).forEach((key) => {
      if (isPlainObject(next[key])) {
        next[key] = recursiveClone(next[key]);
      }
    });
    return next;
  }
  return recursiveClone(source);
}

export function isPromise(x) {
  return x != null && typeof x === 'object' && typeof x.then === 'function';
}

export function get(path, target) {
  return path.reduce(
    (acc, cur) => (isPlainObject(acc) ? acc[cur] : undefined),
    target,
  );
}

export function newify(currentPath, currentState, finalValue) {
  if (currentPath.length === 0) {
    return finalValue;
  }
  const newState = { ...currentState };
  const key = currentPath[0];
  if (currentPath.length === 1) {
    newState[key] = finalValue;
  } else {
    newState[key] = newify(currentPath.slice(1), newState[key], finalValue);
  }
  return newState;
}

export function set(path, target, value) {
  if (path.length === 0) {
    if (typeof value === 'object') {
      Object.keys(target).forEach((key) => {
        delete target[key];
      });
      Object.keys(value).forEach((key) => {
        target[key] = value[key];
      });
    }
    return;
  }
  path.reduce((acc, cur, idx) => {
    if (idx + 1 === path.length) {
      acc[cur] = value;
    } else {
      acc[cur] = acc[cur] || {};
    }
    return acc[cur];
  }, target);
}

export function createSimpleProduce(disableImmer = false) {
  return function simpleProduce(path, state, fn) {
    if (disableImmer) {
      const current = get(path, state);
      const next = fn(current);
      if (current !== next) {
        return newify(path, state, next);
      }
      return state;
    }
    if (!easyPeasyImmer) {
      easyPeasyImmer = new Immer({
        // We need to ensure that we disable proxies if they aren't available
        // on the environment. Users need to ensure that they use the enableES5
        // feature of immer.
        useProxies:
          typeof Proxy !== 'undefined' &&
          typeof Proxy.revocable !== 'undefined' &&
          typeof Reflect !== 'undefined',
        // Autofreezing breaks easy-peasy, we need a mixed version of immutability
        // and mutability in order to apply updates to our computed properties
        autoFreeze: false,
      });
    }
    if (path.length === 0) {
      const draft = easyPeasyImmer.createDraft(state);
      const result = fn(draft);
      if (result) {
        return isDraft(result) ? easyPeasyImmer.finishDraft(result) : result;
      }
      return easyPeasyImmer.finishDraft(draft);
    }
    const parentPath = path.slice(0, path.length - 1);
    const draft = easyPeasyImmer.createDraft(state);
    const parent = get(parentPath, state);
    const current = get(path, draft);
    const result = fn(current);

    if (result) {
      parent[path[path.length - 1]] = result;
    }
    return easyPeasyImmer.finishDraft(draft);
  };
}

const pReduce = (iterable, reducer, initialValue) =>
  new Promise((resolve, reject) => {
    const iterator = iterable[Symbol.iterator]();
    let index = 0;

    const next = (total) => {
      const element = iterator.next();

      if (element.done) {
        resolve(total);
        return;
      }

      Promise.all([total, element.value])
        .then((value) =>
          // eslint-disable-next-line no-plusplus
          next(reducer(value[0], value[1], index++)),
        )
        .catch((err) => reject(err));
    };

    next(initialValue);
  });

export const pSeries = (tasks) => {
  const results = [];
  return pReduce(tasks, (_, task) =>
    task().then((value) => {
      results.push(value);
    }),
  ).then(() => results);
};

export function areInputsEqual(newInputs, lastInputs) {
  if (newInputs.length !== lastInputs.length) {
    return false;
  }
  for (let i = 0; i < newInputs.length; i += 1) {
    if (newInputs[i] !== lastInputs[i]) {
      return false;
    }
  }
  return true;
}

// export function memoizeOne(resultFn) {
//   let lastArgs = [];
//   let lastResult;
//   let calledOnce = false;

//   return function memoized(...args) {
//     if (calledOnce && areInputsEqual(args, lastArgs)) {
//       return lastResult;
//     }
//     lastResult = resultFn(...args);
//     calledOnce = true;
//     lastArgs = args;
//     return lastResult;
//   };
// }

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
