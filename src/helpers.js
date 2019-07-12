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

export const computed = (fn, stateResolvers = defaultStateResolvers) => {
  fn[computedSymbol] = {
    stateResolvers,
  };
  return fn;
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
