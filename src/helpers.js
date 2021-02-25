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

export const actionOn = (targetResolver, fn) => ({
  [actionOnSymbol]: true,
  fn,
  targetResolver,
});

export const action = (fn) => ({
  [actionSymbol]: true,
  fn,
});

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

export const persist = (model, config) =>
  // if we are not running in a browser context this becomes a no-op
  typeof window === 'undefined'
    ? model
    : {
        ...model,
        [persistSymbol]: config,
      };

export const thunkOn = (targetResolver, fn) => ({
  [thunkOnSymbol]: true,
  fn,
  targetResolver,
});

export const thunk = (fn) => ({
  [thunkSymbol]: true,
  fn,
});

export const reducer = (fn) => ({
  [reducerSymbol]: true,
  fn,
});
