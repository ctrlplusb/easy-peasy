import { useLocalStore, Action, action } from 'easy-peasy';

interface StoreModel {
  count: number;
  inc: Action<StoreModel>;
}

const [state, actions, store] = useLocalStore<StoreModel>(() => ({
  count: 0,
  inc: action(state => {
    state.count += 1;
  }),
}));

state.count + 1;
actions.inc();
store.getState().count + 1;

useLocalStore<StoreModel>(
  () => ({
    count: 0,
    inc: action(state => {
      state.count += 1;
    }),
  }),
  ['foo', 123],
);

useLocalStore<StoreModel>(
  () => ({
    count: 0,
    inc: action(state => {
      state.count += 1;
    }),
  }),
  ['foo', 123],
  {
    name: 'MyLocalStore',
  },
);
