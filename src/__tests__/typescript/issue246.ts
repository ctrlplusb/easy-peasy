import { Action, action, createStore, Model, model } from 'easy-peasy';

interface Item {
  id: number;
  name: string;
}

interface BeholderModel extends BaseListModel<BeholderModel> {
  // Extra stuff for interface
  beholderName: string;
}

interface CreatorModel extends BaseListModel<CreatorModel> {
  // Extra stuff for interface
  creatorName: string;
}

// error at <T, ...> in setList
type BaseListModel<T extends object> = Model<{
  list: Item[];
  setList: Action<BaseListModel<T>, Item[]>;
}>;

type StoreModel = Model<{
  beholder: BeholderModel;
  creator: CreatorModel;
}>;

const storeModel: StoreModel = model<StoreModel>({
  beholder: model({
    beholderName: 'foo',
    list: [],
    setList: action((state, payload) => {
      state.list = payload;
    }),
  }),
  creator: model({
    creatorName: 'foo',
    list: [],
    setList: action((state, payload) => {
      state.list = payload;
    }),
  }),
});

const store = createStore(storeModel);

store.getState().beholder.beholderName + 'foo';
store.getState().beholder.list;
store.getState().creator.creatorName + 'bar';
store.getActions().creator.setList([{ id: 1, name: 'foo' }]);
