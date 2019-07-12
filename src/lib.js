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
  path.reduce((acc, cur, idx) => {
    if (idx + 1 === path.length) {
      acc[cur] = value;
    } else {
      acc[cur] = acc[cur] || {};
    }
    return acc[cur];
  }, target);
};
