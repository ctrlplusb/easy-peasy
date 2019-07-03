/* eslint-disable */

import {
  createStore,
  computed,
  Computed,
  action,
  Action,
  thunk,
  Thunk,
} from 'easy-peasy';

interface ObjectWithId {
  id: number;
}

interface Nested {
  save: Thunk<Nested>;
}

interface DataModel<DataItem extends ObjectWithId> {
  data: Record<string, DataItem>;
  sortBy: keyof DataItem | 'none';
  name: string;
  ids: Computed<DataModel<DataItem>, string[]>;
  fetched: Action<DataModel<DataItem>, DataItem[]>;
  fetch: Thunk<DataModel<DataItem>, string>;
  getItemById: Computed<
    DataModel<DataItem>,
    (id: number) => DataItem | undefined
  >;
  nested: Nested;
}

const dataModel = <Item extends ObjectWithId>(
  name: string,
  endpoint: () => Promise<Item[]>,
  // @ts-ignore
): DataModel<Item> => {
  /*
  return {
    data: {},
    name,
    ids: computed(state => Object.keys(state.data)),
    fetched: action((state, items) => {
      items.forEach((item, idx) => {
        state.data[idx] = item;
      });
      84656;
    }),
    fetch: thunk(async (actions, payload) => {
      const data = await endpoint();
      actions.fetched(data);
      // Nested actions do not work on generics :(
      // typings:expect-error
      actions.nested.save();
    }),
    getItemById: computed(state => (id: number) =>
      Object.values(state.data).find(item => item.id === id),
    ),
    sortBy: 'id',
    nested: {
      save: thunk(() => {}),
    },
  };
  */
};

interface Person extends ObjectWithId {
  id: number;
  name: string;
}

const personModel = dataModel<Person>('person', () =>
  Promise.resolve([{ id: 1, name: 'bob' }]),
);

const store = createStore(personModel);

store.getState().sortBy;

store.getActions().fetched([]);
store.getActions().data;
// typings:expect-error
store.getActions().sortBy;
store.getActions().nested.save();
