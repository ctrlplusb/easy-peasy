import { debug, action, Action, Model, model } from 'easy-peasy';

type StoreModel = Model<{
  logs: string[];
  add: Action<StoreModel, string>;
}>;

const storeModel = model<StoreModel>({
  logs: [],
  add: action((state, payload) => {
    const foo = debug(state);
    console.log(foo);
  }),
});
