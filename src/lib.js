export const deepCloneObjectStructure = x => {
  const recursiveClone = current => {
    const next = { ...current };
    Object.keys(next).forEach(key => {
      if (typeof next[key] === 'object') {
        next[key] = recursiveClone(next[key]);
      }
    });
    return next;
  };
  return recursiveClone(x);
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
