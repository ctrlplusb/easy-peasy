import {
  action,
  createStore,
  createTransform,
  thunk,
  Action,
  Thunk,
} from 'easy-peasy/server';

interface StoreModel {
  count: number;
  increment: Action<StoreModel>;
  bumpAsync: Thunk<StoreModel>;
}

const model: StoreModel = {
  count: 0,
  increment: action((state) => {
    state.count += 1;
  }),
  bumpAsync: thunk(async (actions) => {
    actions.increment();
  }),
};

const store = createStore(model);

store.getState().count.toFixed(0);
store.getActions().increment();
void store.getActions().bumpAsync();

const transform = createTransform(
  (data: unknown) => data,
  (data: unknown) => data,
  { whitelist: ['count'] },
);

void transform;
