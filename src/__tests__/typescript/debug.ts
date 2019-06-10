import { debug, action, Action } from 'easy-peasy';

interface Model {
  logs: string[];
  add: Action<Model, string>;
}

const model: Model = {
  logs: [],
  add: action((state, payload) => {
    const foo = debug(state);
    console.log(foo);
  }),
};
