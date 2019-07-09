import { isDraft, createDraft, finishDraft } from 'immer-peasy';
import memoizerific from 'memoizerific';
import {
  actionStateSymbol,
  actionSymbol,
  listenerActionSymbol,
  listenerThunkSymbol,
  computedSymbol,
  computedConfigSymbol,
  reducerSymbol,
  thunkStateSymbol,
  thunkSymbol,
} from './constants';

export const debug = state => {
  if (isDraft(state)) {
    return finishDraft(createDraft(state));
  }
  return state;
};

export const memo = (fn, cacheSize) => memoizerific(cacheSize)(fn);

export const actionOn = (fn, targetResolver) => {
  fn[listenerActionSymbol] = true;
  fn[actionStateSymbol] = {
    targetResolver,
  };
  return fn;
};

export const action = fn => {
  fn[actionSymbol] = true;
  return fn;
};

const defaultStateResolvers = [state => state];

export const computed = (fn, stateResolvers = defaultStateResolvers) => {
  fn[computedSymbol] = true;
  fn[computedConfigSymbol] = {
    stateResolvers,
  };
  return fn;
};

export const thunkOn = (fn, targetResolver) => {
  fn[listenerThunkSymbol] = true;
  fn[thunkStateSymbol] = {
    targetResolver,
  };
  return fn;
};

export const thunk = fn => {
  fn[thunkSymbol] = true;
  return fn;
};

export const reducer = fn => {
  fn[reducerSymbol] = true;
  return fn;
};
