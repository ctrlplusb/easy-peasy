// requestIdleCallback is defined, but not invoked in iOS, so we use requestAnimationFrame instead
// The RN bundler will import this file instead of timingMethod.js on iOS
const timingMethod =
  typeof window === 'undefined' ? (fn) => fn() : window.requestAnimationFrame;

export default timingMethod;
