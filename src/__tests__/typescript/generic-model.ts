/* eslint-disable */

import { action, Action } from 'easy-peasy';

/**
 * ARRANGE
 */

interface Person {
  name: string;
}

/**
 * WORKING CASE - "NORMAL" MODEL INTERFACE
 */

interface NormalModel {
  data: Person[];
  fetch: Action<NormalModel>;
}

const normalModel: NormalModel = {
  data: [],
  fetch: action(state => {
    //      👍 works
    state.data[0].name;
  }),
};

/**
 * WORKING CASE - "GENERIC" MODEL INTERFACE
 */

interface ObjectWithId {
  id: string;
}

interface GenericModel<Item extends ObjectWithId> {
  data: Item[];
  fetch: Action<GenericModel<Item>>;
}

const createModel = <Item extends ObjectWithId>(): GenericModel<Item> => {
  return {
    data: [],
    fetch: action(state => {
      state.data.forEach(({ id }) => id);
    }),
  };
};

/***
 * BROKEN CASE - #300
 */

interface SimpleModel<T> {
  thevalue: T;
  theset: Action<SimpleModel<T>, T>;
}

const makeSimpleModel = <T>(initialValue: T): SimpleModel<T> => {
  return {
    thevalue: initialValue,
    theset: action((state, payload) => {
      // @ts-ignore
      state.thevalue = payload;
    }),
  };
};

/**
 * WORKAROUND - #300
 */

type Value<T> = [T];

interface SimpleModelWorkaround<T> {
  thevalue: Value<T>;
  theset: Action<SimpleModelWorkaround<T>, T>;
}

const makeSimpleModelWorking = <T>(
  initialValue: T,
): SimpleModelWorkaround<T> => {
  return {
    thevalue: [initialValue],
    theset: action((state, payload) => {
      state.thevalue = [payload];
    }),
  };
};
