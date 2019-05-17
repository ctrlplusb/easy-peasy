import {
  actionNameSymbol,
  actionSymbol,
  selectorSymbol,
  selectorConfigSymbol,
  listenSymbol,
  reducerSymbol,
  selectDependenciesSymbol,
  selectStateSymbol,
  selectSymbol,
  thunkSymbol,
} from './constants';

export const actionName = action => action[actionNameSymbol];

export const thunkStartName = action => `${action[actionNameSymbol]}(started)`;

export const thunkCompleteName = action =>
  `${action[actionNameSymbol]}(completed)`;

export const thunkFailName = action => `${action[actionNameSymbol]}(failed)`;

export const action = fn => {
  fn[actionSymbol] = true;
  return fn;
};

export const derived = (args, fn, config) => {
  fn[derivedSymbol] = true;
  fn[derivedConfigSymbol] = {
    args,
    config,
  };
  return fn;
};

export const listen = fn => {
  fn[listenSymbol] = true;
  return fn;
};

export const thunk = fn => {
  fn[thunkSymbol] = true;
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
