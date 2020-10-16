import { isDraft, current } from 'immer';
import {
  actionOnSymbol,
  actionSymbol,
  computedSymbol,
  effectOnSymbol,
  persistSymbol,
  reducerSymbol,
  thunkOnSymbol,
  thunkSymbol,
} from './constants';

export const debug = (state) => {
  if (isDraft(state)) {
    return current(state);
  }
  return state;
};

// eslint-disable-next-line no-unused-vars
export const memo = (fn, cacheSize) => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(
      'Easy Peasy no longer ships with a memoization util. We suggest installing something like fast-memoize as an alternative.',
    );
  }
  return fn;
};

export const actionOn = (targetResolver, fn) => {
  return {
    [actionOnSymbol]: true,
    fn,
    targetResolver,
  };
};

export const action = (fn) => {
  return {
    [actionSymbol]: true,
    fn,
  };
};

const defaultStateResolvers = [(state) => state];

export const computed = (fnOrStateResolvers, fn) => {
  if (typeof fn === 'function') {
    return {
      [computedSymbol]: true,
      fn,
      stateResolvers: fnOrStateResolvers,
    };
  }
  return {
    [computedSymbol]: true,
    fn: fnOrStateResolvers,
    stateResolvers: defaultStateResolvers,
  };
};

export function unstable_effectOn(dependencyResolvers, fn) {
  return {
    [effectOnSymbol]: true,
    dependencyResolvers,
    fn,
  };
}

export function generic(value) {
  return value;
}

export const persist = (model, config) => {
  // if we are not running in a browser context this becomes a no-op
  return typeof window === 'undefined'
    ? model
    : {
        ...model,
        [persistSymbol]: config,
      };
};

export const thunkOn = (targetResolver, fn) => {
  return {
    [thunkOnSymbol]: true,
    fn,
    targetResolver,
  };
};

export const thunk = (fn) => {
  return {
    [thunkSymbol]: true,
    fn,
  };
};

export const reducer = (fn) => {
  return {
    [reducerSymbol]: true,
    fn,
  };
};
