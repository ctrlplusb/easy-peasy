import { thunk, Thunk } from 'easy-peasy';

type Injections = any;

interface IModelActions<T> {
  someThunk: Thunk<this, T, Injections, IStoreModel>;
}

interface IModel<T> extends IModelActions<T> {
  someValue: T;
}

interface IStoreModel {
  a: IModel<string>;
  b: IModel<number>;
}

const createModelActions = <T>(): IModelActions<T> => {
  return {
    someThunk: thunk(() => {}),
  };
};

const storeModel: IStoreModel = {
  a: {
    someValue: 'hello',
    ...createModelActions<string>(),
  },
  b: {
    someValue: 123,
    ...createModelActions<number>(),
  },
};
