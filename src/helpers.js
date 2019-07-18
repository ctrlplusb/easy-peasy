import { isDraft, createDraft, finishDraft } from 'immer-peasy';
import memoizerific from 'memoizerific';
import {
  actionOnSymbol,
  actionSymbol,
  computedSymbol,
  reducerSymbol,
  thunkOnSymbol,
  thunkSymbol,
} from './constants';

export const debug = state => {
  if (isDraft(state)) {
    return finishDraft(createDraft(state));
  }
  return state;
};

export const memo = (fn, cacheSize) => memoizerific(cacheSize)(fn);

export const actionOn = (targetResolver, fn, config = {}) => {
  fn[actionOnSymbol] = {
    config,
    targetResolver,
  };
  return fn;
};

export const action = (fn, config = {}) => {
  fn[actionSymbol] = {
    config,
  };
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

export const thunkOn = (targetResolver, fn, config = {}) => {
  fn[thunkOnSymbol] = {
    config,
    targetResolver,
  };
  return fn;
};

export const thunk = (fn, config = {}) => {
  fn[thunkSymbol] = {
    config,
  };
  return fn;
};

export const reducer = fn => {
  fn[reducerSymbol] = {};
  return fn;
};
