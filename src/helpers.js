import { isDraft, finishDraft, createDraft } from 'immer-peasy';
import memoizerific from 'memoizerific';
import {
  actionNameSymbol,
  actionStateSymbol,
  actionSymbol,
  computedSymbol,
  computedConfigSymbol,
  reducerSymbol,
  thunkStateSymbol,
  thunkSymbol,
} from './constants';

export const actionName = action => action[actionNameSymbol];

export const debug = state => {
  if (isDraft(state)) {
    const final = finishDraft(createDraft(state));
    return final;
  }
  return state;
};

export const memo = (fn, cacheSize) => memoizerific(cacheSize)(fn);

export const thunkStartName = action => `${action[actionNameSymbol]}(started)`;

export const thunkCompleteName = action =>
  `${action[actionNameSymbol]}(completed)`;

export const thunkFailName = action => `${action[actionNameSymbol]}(failed)`;

export const action = (fn, config) => {
  fn[actionSymbol] = true;
  fn[actionStateSymbol] = {
    config,
  };
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

export const thunk = (fn, config) => {
  fn[thunkSymbol] = true;
  fn[thunkStateSymbol] = {
    config,
  };
  return fn;
};

export const reducer = fn => {
  fn[reducerSymbol] = true;
  return fn;
};
