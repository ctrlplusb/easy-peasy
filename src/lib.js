import isPlainObject from 'is-plain-object';
import { createDraft, finishDraft, isDraft } from 'immer-peasy';

export const deepCloneStateWithoutComputed = source => {
  const recursiveClone = current => {
    const next = Object.keys(current).reduce((acc, key) => {
      if (Object.getOwnPropertyDescriptor(current, key).get == null) {
        acc[key] = current[key];
      }
      return acc;
    }, {});
    Object.keys(next).forEach(key => {
      if (isPlainObject(next[key])) {
        next[key] = recursiveClone(next[key]);
      }
    });
    return next;
  };
  return recursiveClone(source);
};

export const isPromise = x => {
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
      Object.keys(target).forEach(key => {
        delete target[key];
      });
      Object.keys(value).forEach(key => {
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
      const draft = createDraft(state);
      const result = fn(draft);
      if (result) {
        return isDraft(result) ? finishDraft(result) : result;
      }
      return finishDraft(draft);
    }
    const parentPath = path.slice(0, path.length - 1);
    const draft = createDraft(state);
    const parent = get(parentPath, state);
    const current = get(path, draft);
    const result = fn(current);

    if (result) {
      parent[path[path.length - 1]] = result;
    }
    return finishDraft(draft);
  };
}
