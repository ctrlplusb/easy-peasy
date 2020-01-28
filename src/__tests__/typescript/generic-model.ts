/* eslint-disable */

import {
  action,
  Action,
  thunk,
  Thunk,
  Model,
  model,
  Generic,
  generic,
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

type NormalModel = Model<{
  data: Person[];
  fetch: Action<NormalModel>;
}>;

const normalModel = model<NormalModel>({
  data: [],
  fetch: action(state => {
    //      👍 works
    state.data[0].name;
  }),
});

/**
 * WORKING CASE - "GENERIC" MODEL INTERFACE
 */

interface ObjectWithId {
  id: string;
}

type GenericModelTest<Item extends ObjectWithId> = Model<{
  data: Item[];
  foo: number;
  fetch: Action<GenericModelTest<Item>>;
}>;

const createModel = <Item extends ObjectWithId>(): GenericModelTest<Item> => {
  return model({
    data: [],
    foo: 1,
    fetch: action(state => {
      state.data.forEach(({ id }) => id);
    }),
  });
};

/***
 * #300
 */

type SimpleModel<T> = Model<{
  name: string;
  value: Generic<T>;
  theset: Action<SimpleModel<T>, T>;
  flag: boolean;
  age: number;
}>;

model<SimpleModel<number>>({
  age: 35,
  flag: false,
  name: 'Mary',
  value: generic(123),
  theset: action((state, payload) => {
    state.age = 35;
    state.flag = true;
    state.name = 'bar';
    state.value = payload;
  }),
});

function makeSimpleModel<T>(initialValue: T): SimpleModel<T> {
  return model({
    age: 35,
    flag: true,
    name: 'bob',
    theset: action((state, payload) => {
      state.name = 'bar';
      state.value = initialValue;
      state.value = payload;
      state.age = 35;
      state.flag = true;
    }),
    value: generic(initialValue),
  });
}

/**
 * #345
 */

interface Base {
  a: string;
}

type GenericModelFoo<M extends Base> = Model<{
  data: M[];
  add: Action<GenericModelFoo<M>, M>;
  doSomething: Thunk<GenericModelFoo<M>, M>;
}>;

function getModel<M extends Base>(): GenericModelFoo<M> {
  return model({
    data: [],
    add: action((state, payload) => {
      payload.a + 'foo';
      state.data.push(payload);
    }),
    doSomething: thunk((actions, payload) => {
      payload.a;
      actions.doSomething(payload);
      actions.add(payload); // <-- Here actions.add expects parameter to be `void & string`
    }),
  });
}
