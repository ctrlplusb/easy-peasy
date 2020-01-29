export default function isPromise(x) {
  return x != null && typeof x === 'object' && typeof x.then === 'function';
}
