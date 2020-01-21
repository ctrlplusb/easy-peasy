import { isDraft, original } from 'immer';
import memoizerific from 'memoizerific';
import {
  actionOnSymbol,
  actionSymbol,
  computedSymbol,
  modelSymbol,
  reducerSymbol,
  thunkOnSymbol,
  thunkSymbol,
} from './constants';

export function debug(state) {
  if (isDraft(state)) {
    return original(state);
  }
  return state;
}

export function memo(fn, cacheSize) {
  return memoizerific(cacheSize)(fn);
}

export function actionOn(targetResolver, fn) {
  fn[actionOnSymbol] = {
    targetResolver,
  };
  return fn;
}

export function action(fn) {
  fn[actionSymbol] = {};
  return fn;
}

const defaultStateResolvers = [state => state];

export function computed(fnOrStateResolvers, fn) {
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
}

export function model(modelDefinition, config) {
  return {
    ...modelDefinition,
    [modelSymbol]: config || {},
  };
}

// /* eslint-disable-next-line no-shadow */
// export function persist(model, config) {
//   return {
//     ...model,
//     [persistSymbol]: config,
//   };
// };

export function thunkOn(targetResolver, fn) {
  fn[thunkOnSymbol] = {
    targetResolver,
  };
  return fn;
}

export function thunk(fn) {
  fn[thunkSymbol] = {};
  return fn;
}

export function reducer(fn) {
  fn[reducerSymbol] = {};
  return fn;
}
