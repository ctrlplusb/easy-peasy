import { isDraft, finishDraft, createDraft } from 'immer';
import {
  actionNameSymbol,
  actionStateSymbol,
  actionSymbol,
  listenSymbol,
  reducerSymbol,
  selectDependenciesSymbol,
  selectorConfigSymbol,
  selectorSymbol,
  selectStateSymbol,
  selectSymbol,
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

export const listen = fn => {
  fn[listenSymbol] = true;
  return fn;
};

export const thunk = (fn, config) => {
  fn[thunkSymbol] = true;
  fn[thunkStateSymbol] = {
    config,
  };
  return fn;
};

export const select = (fn, dependencies) => {
  fn[selectSymbol] = true;
  fn[selectDependenciesSymbol] = dependencies;
  fn[selectStateSymbol] = {};
  return fn;
};

export const selector = (args, fn, config) => {
  fn[selectorSymbol] = true;
  fn[selectorConfigSymbol] = {
    args,
    config,
  };
  return fn;
};

export const reducer = fn => {
  fn[reducerSymbol] = true;
  return fn;
};
