import { Immer, isDraft } from 'immer';

/**
 * We create our own immer instance to avoid potential issues with autoFreeze
 * becoming default enabled everywhere. We want to disable autofreeze as it
 * does not suit the design of Easy Peasy.
 * https://github.com/immerjs/immer/issues/681#issuecomment-705581111
 */
const easyPeasyImmer = new Immer({
  useProxies: true,
  autoFreeze: false,
});

/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

export function isPlainObject(o) {
  if (isObject(o) === false) return false;

  // If has modified constructor
  const ctor = o.constructor;
  if (ctor === undefined) return true;

  // If has modified prototype
  const prot = ctor.prototype;
  if (isObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  // eslint-disable-next-line no-prototype-builtins
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

export const deepCloneStateWithoutComputed = (source) => {
  const recursiveClone = (current) => {
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
  };
  return recursiveClone(source);
};

export const isPromise = (x) => {
  return x != null && typeof x === 'object' && typeof x.then === 'function';
};

export function get(path, target) {
  return path.reduce((acc, cur) => {
    return isPlainObject(acc) ? acc[cur] : undefined;
  }, target);
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

export const set = (path, target, value) => {
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
};

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

    const next = async (total) => {
      const element = iterator.next();

      if (element.done) {
        resolve(total);
        return;
      }

      try {
        const value = await Promise.all([total, element.value]);
        // eslint-disable-next-line no-plusplus
        next(reducer(value[0], value[1], index++));
      } catch (error) {
        reject(error);
      }
    };

    next(initialValue);
  });

export const pSeries = async (tasks) => {
  const results = [];

  await pReduce(tasks, async (_, task) => {
    const value = await task();
    results.push(value);
  });

  return results;
};
