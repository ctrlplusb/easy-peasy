import { createStore, action, Action, Model, model } from 'easy-peasy';

type TodosModel = Model<{
  items: string[];
  add: Action<TodosModel, string>;
  clear: Action<TodosModel>;
}>;

type StoreModel = Model<{
  todos: TodosModel;
}>;

const todos = model<TodosModel>({
  items: [],
  add: action((state, payload) => {
    state.items.push(payload);
  }),
  clear: action(state => {
    state.items = [];
  }),
});

const storeModel = model<StoreModel>({
  todos,
});

const store = createStore(storeModel);

store.dispatch.todos.add('foo');

// typings:expect-error
store.dispatch.todos.add(1);

// typings:expect-error
store.dispatch.todos.add();

store.dispatch.todos.clear();
