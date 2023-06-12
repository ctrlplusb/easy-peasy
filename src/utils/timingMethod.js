// Note: requestIdleCallback is not available on iOS - see timingMethod.ios.js
const timingMethod =
  typeof window === 'undefined'
    ? (fn) => fn()
    : window.requestIdleCallback != null
    ? window.requestIdleCallback
    : window.requestAnimationFrame;

export default timingMethod;
