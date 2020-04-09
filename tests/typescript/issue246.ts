import { Action, action, createStore } from 'easy-peasy';

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
interface BaseListModel<T extends object> {
  list: Item[];
  setList: Action<T, Item[]>;
}

interface StoreModel {
  beholder: BeholderModel;
  creator: CreatorModel;
}

const model: StoreModel = {
  beholder: {
    beholderName: 'foo',
    list: [],
    setList: action((state, payload) => {
      state.list = payload;
    }),
  },
  creator: {
    creatorName: 'foo',
    list: [],
    setList: action((state, payload) => {
      state.list = payload;
    }),
  },
};

const store = createStore(model);

store.getState().beholder.beholderName;
store.getState().beholder.list;
store.getActions().creator.setList([{ id: 1, name: 'foo' }]);
