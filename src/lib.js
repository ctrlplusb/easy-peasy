import isPlainObject from 'is-plain-object';

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

export function resolvePersistTargets(target, whitelist, blacklist) {
  let targets = Object.keys(target);
  if (whitelist.length > 0) {
    targets = targets.reduce((acc, cur) => {
      if (whitelist.findIndex(x => x === cur) !== -1) {
        return [...acc, cur];
      }
      return acc;
    }, []);
  }
  if (blacklist.length > 0) {
    targets = targets.reduce((acc, cur) => {
      if (blacklist.findIndex(x => x === cur) !== -1) {
        return acc;
      }
      return [...acc, cur];
    }, []);
  }
  return targets;
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
