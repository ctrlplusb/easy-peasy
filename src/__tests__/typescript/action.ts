import { createStore, action, Action } from 'easy-peasy';

interface TodosModel {
  items: string[];
  add: Action<TodosModel, string>;
  clear: Action<TodosModel>;
}

interface Model {
  todos: TodosModel;
}

const model: Model = {
  todos: {
    items: [],
    add: action((state, payload) => {
      state.items.push(payload);
    }),
    clear: action(state => {
      state.items = [];
    }),
  },
};

const store = createStore(model);

store.dispatch.todos.add('foo');
// typings:expect-error
store.dispatch.todos.add(1);
// typings:expect-error
store.dispatch.todos.add();

store.dispatch.todos.clear();
