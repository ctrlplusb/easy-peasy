import isPlainObject from 'is-plain-object';

export default function get(path, target) {
  return path.reduce((acc, cur) => {
    return isPlainObject(acc) ? acc[cur] : undefined;
  }, target);
}
