import { isDraft, original } from 'immer-peasy';
import memoizerific from 'memoizerific';
import {
  actionOnSymbol,
  actionSymbol,
  computedSymbol,
  persistSymbol,
  reducerSymbol,
  thunkOnSymbol,
  thunkSymbol,
} from './constants';

export const debug = state => {
  if (isDraft(state)) {
    return original(state);
  }
  return state;
};

export const memo = (fn, cacheSize) => memoizerific(cacheSize)(fn);

export const actionOn = (targetResolver, fn) => {
  fn[actionOnSymbol] = {
    targetResolver,
  };
  return fn;
};

export const action = fn => {
  fn[actionSymbol] = {};
  return fn;
};

const defaultStateResolvers = [state => state];

export const computed = (fnOrStateResolvers, fn) => {
  if (typeof fn === 'function') {
    fn[computedSymbol] = {
      stateResolvers: fnOrStateResolvers,
    };
    return fn;
  }
  fnOrStateResolvers[computedSymbol] = {
    stateResolvers: defaultStateResolvers,
  };
  return fnOrStateResolvers;
};

export const persist = (model, config) => {
  return {
    ...model,
    [persistSymbol]: config,
  };
};

export const thunkOn = (targetResolver, fn) => {
  fn[thunkOnSymbol] = {
    targetResolver,
  };
  return fn;
};

export const thunk = fn => {
  fn[thunkSymbol] = {};
  return fn;
};

export const reducer = fn => {
  fn[reducerSymbol] = {};
  return fn;
};
