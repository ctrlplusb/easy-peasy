import isPlainObject from 'is-plain-object';

export default function deepCloneState(source) {
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
}
