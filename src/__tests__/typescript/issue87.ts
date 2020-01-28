/* eslint-disable */

import { action, Action, createStore, Model, model } from 'easy-peasy';

interface IAnimal {
  name: string;
  age?: number;
}

type StoreModel = Model<{
  animal: IAnimal;
  setAnimal: Action<StoreModel, { animal: IAnimal }>;
}>;

const storeModel = model<StoreModel>({
  animal: {
    name: 'robert',
  },
  setAnimal: action((state, payload) => {
    return { ...state, animal: payload.animal };
  }),
});

const store = createStore(storeModel);
