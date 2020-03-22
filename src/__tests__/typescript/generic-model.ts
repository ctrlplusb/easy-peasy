/* eslint-disable */

import {
  action,
  Action,
  Generic,
  generic,
  thunk,
  Thunk,
  createStore,
} from 'easy-peasy';

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
  count: number;
  thevalue: Generic<T>;
  theset: Action<SimpleModel<T>, T>;
}

const makeSimpleModel = <T>(initialValue: T): SimpleModel<T> => {
  return {
    count: 1,
    thevalue: generic(initialValue),
    theset: action((state, payload) => {
      state.count = 1;
      state.thevalue = payload;
      // typings:expect-error
      state.theset();
    }),
  };
};

const numberModel = makeSimpleModel<number>(1337);

const store = createStore(numberModel);
store.getState().thevalue + 1;

/**
 * #345
 */

interface Base {
  a: string;
}

interface Model<M extends Base> {
  data: Generic<M[]>;
  add: Action<Model<M>, M>;
  doSomething: Thunk<Model<M>, M>;
}

function getModel<M extends Base>(): Model<M> {
  return {
    data: generic([]),
    add: action((state, payload) => {
      payload.a + 'foo';
      state.data.push(payload);
    }),
    doSomething: thunk((actions, payload) => {
      payload.a;
      actions.add(payload); // <-- Here actions.add expects parameter to be `void & string`
    }),
  };
}
