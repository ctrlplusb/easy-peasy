import {
  actionNameSymbol,
  actionSymbol,
  listenSymbol,
  reducerSymbol,
  selectDependenciesSymbol,
  selectStateSymbol,
  selectSymbol,
  thunkSymbol,
} from './constants'

export const actionName = action => action[actionNameSymbol]

export const thunkStartName = action => `${action[actionNameSymbol]}(started)`

export const thunkCompleteName = action =>
  `${action[actionNameSymbol]}(completed)`

export const action = fn => {
  fn[actionSymbol] = true
  return fn
}

export const listen = fn => {
  fn[listenSymbol] = true
  return fn
}

export const thunk = fn => {
  fn[thunkSymbol] = true
  return fn
}

export const select = (fn, dependencies) => {
  fn[selectSymbol] = true
  fn[selectDependenciesSymbol] = dependencies
  fn[selectStateSymbol] = {}
  return fn
}

export const reducer = fn => {
  fn[reducerSymbol] = true
  return fn
}
