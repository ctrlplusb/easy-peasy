/* eslint-disable */

import { createStore, select, Select, action, Action } from 'easy-peasy';

interface IMyInterface {
  name: string;
}

interface Person extends IMyInterface {}

interface IMyStoreModel<T extends IMyInterface> {
  myMap: Record<string, T>;
  setMyMap: Action<IMyStoreModel<T>, Record<string, T>>;
  values: Select<IMyStoreModel<T>, Array<T>>;
  names: Select<IMyStoreModel<T>, Array<string>>;
}

const generateModel = <T extends IMyInterface>(): IMyStoreModel<T> => {
  return {
    myMap: {},
    setMyMap: action((state, payload) => {
      state.myMap = payload;
    }),
    values: select(state => {
      return Object.keys(state.myMap).map(key => state.myMap[key]);
    }),
    names: select(state => state.values.map(x => name)),
  };
};

const store = createStore(generateModel<Person>());

const foo = Object.values(store.getState().myMap);
foo[0].name = 'bob';

store.getState().myMap = {
  foo: { name: 'bob' },
};

store.getState().values.map(x => x.name);

store.getState().myMap['foo'] = { name: 'bob' };

store.getState().myMap['foo'].name + 'foo';
