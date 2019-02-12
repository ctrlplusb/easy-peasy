import { Action, createStore } from 'easy-peasy'

interface IAnimal {
  name?: string;
}

interface IModel {
  animal: IAnimal;
  setAnimal: Action<IModel, { animal: IAnimal }>;
}

const model: IModel = {
  animal: {
    name: "robert"
  },
  setAnimal: (state, payload) => {
    return { ...state, animal: payload.animal };
  }
};

const store = createStore(model);