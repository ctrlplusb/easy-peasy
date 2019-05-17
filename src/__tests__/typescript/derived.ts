/* eslint-disable */

import { createStore, derived, Derived, Selector } from 'easy-peasy';

interface Todo {
  id: number;
  text: string;
}

type DerivedCount = Derived<TodosModel, number, [Array<Todo>]>;

interface TodosModel {
  items: Array<Todo>;
  count: DerivedCount;
  getById: Derived<TodosModel, Todo | undefined, [Array<Todo>], [number]>;
}

interface StatusModel {
  totalTodos: Derived<
    StatusModel,
    number,
    [Selector<DerivedCount>],
    void,
    StoreModel
  >;
}

interface StoreModel {
  todos: TodosModel;
  status: StatusModel;
}

const model: StoreModel = {
  todos: {
    items: [],
    count: derived([state => state.items], items => {
      return items.length;
    }),
    getById: derived([state => state.items], (items, id) => {
      return items.find(x => x.id === id);
    }),
  },
  status: {
    totalTodos: derived(
      [(state, storeState) => storeState.todos.count],
      count => count(),
    ),
  },
};

const store = createStore(model);

const count = store.getState().todos.count();

count + 1;

// typings:expect-error
store.getState().todos.getById();

// typings:expect-error
store.getState().todos.getById('foo');

const todo = store.getState().todos.getById(1);

// typings:expect-error
todo.text + 'foo';

if (todo) {
  todo.text + 'foo';
  todo.id + 1;
  // typings:expect-error
  todo.id + true;
}
