/* eslint-disable */

import { createStore, select, Select } from 'easy-peasy';

interface IMyInterface {
  name: string;
}

interface Person extends IMyInterface {}

interface IMyStoreModel<T extends IMyInterface> {
  myMap: {
    [id: string]: T;
  };
  values: Select<IMyStoreModel<T>, Array<T>>;
}

const generateModel = <T extends IMyInterface>(): IMyStoreModel<T> => {
  return {
    myMap: {},
    values: select(state =>
      Object.keys(state.myMap).map(key => state.myMap[key]),
    ),
  };
};

const store = createStore(generateModel<Person>());

store.getState().myMap['foo'] = { name: 'bob' };

store.getState().myMap['foo'].name = 'bob';
