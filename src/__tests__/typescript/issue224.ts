/* eslint-disable */

import {
  createStore,
  computed,
  Computed,
  action,
  Action,
  thunk,
  Thunk,
  Model,
  model,
} from 'easy-peasy';

interface ObjectWithId {
  id: string;
}

type NestedModel = Model<{
  save: Thunk<NestedModel, number>;
}>;

type DataModel<DataItem extends ObjectWithId> = Model<{
  data: { [key: number]: DataItem };
  // 🚨 THIS BREAKS TYPESCRIPT 😭 🚨
  // sortBy: 'none' | keyof DataItem;
  sortBy: 'none' | string;
  name: string;
  ids: Computed<DataModel<DataItem>, number[]>;
  fetched: Action<DataModel<DataItem>, DataItem[]>;
  fetch: Thunk<DataModel<DataItem>, string>;
  getItemById: Computed<
    DataModel<DataItem>,
    (id: string) => DataItem | undefined
  >;
  nested: NestedModel;
}>;

const dataModel = <Item extends ObjectWithId>(
  name: string,
  endpoint: () => Promise<Item[]>,
): DataModel<Item> => {
  return model({
    data: {},
    sortBy: 'none',
    name,
    ids: computed(state => Object.keys(state.data).map(id => parseInt(id))),
    fetched: action((state, items) => {
      state.name;
      items.forEach((item, idx) => {
        state.data[idx] = item;
      });
    }),
    fetch: thunk(async (actions, payload) => {
      const data = await endpoint();
      actions.fetched(data);
      actions.nested.save(1);
    }),
    getItemById: computed(state => (id: string) =>
      Object.values(state.data).find(item => item.id === id),
    ),
    nested: model({
      save: thunk((actions, payload) => {
        actions.save(payload + 1);
      }),
    }),
  });
};

interface Person extends ObjectWithId {
  id: string;
  name: string;
}

const personModel = dataModel<Person>('person', () =>
  Promise.resolve([{ id: '1', name: 'bob' }]),
);

const store = createStore(personModel);

store.getActions().fetched([]);
store.getActions().nested.save(1);

store.getState().data[1].id + 'foo';
store.getState().data[1].name;
