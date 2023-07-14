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
  id: string;
}

interface Nested {
  save: Thunk<Nested, number>;
}

interface DataModel<DataItem extends ObjectWithId> {
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
  nested: Nested;
}

const dataModel = <Item extends ObjectWithId>(
  name: string,
  endpoint: () => Promise<Item[]>,
): DataModel<Item> => {
  const result: DataModel<Item> = {
    data: {},
    sortBy: 'none',
    name,
    ids: computed((state) => Object.keys(state.data).map((id) => parseInt(id))),
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
    getItemById: computed((state) => (id: string) =>
      Object.values(state.data).find((item) => item.id === id),
    ),
    nested: {
      save: thunk((actions, payload) => {
        actions.save(payload + 1);
      }),
    },
  };
  return result;
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
// @ts-expect-error
store.getActions().data;
store.getActions().nested.save(1);
