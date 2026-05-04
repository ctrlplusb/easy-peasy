let transitionFn = (callback) => callback();

export function setTransitionFn(fn) {
  transitionFn = typeof fn === 'function' ? fn : (callback) => callback();
}

export function runWithTransition(callback) {
  transitionFn(callback);
}
