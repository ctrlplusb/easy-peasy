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

export const isStateObject = x =>
  x !== null &&
  typeof x === 'object' &&
  !Array.isArray(x) &&
  x.constructor === Object;

export const get = (path, target) =>
  path.reduce((acc, cur) => {
    return isStateObject(acc) ? acc[cur] : undefined;
  }, target);

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
