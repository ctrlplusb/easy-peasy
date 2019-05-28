/* eslint-disable */

import { createStore, selector, Selector, SelectorRef } from 'easy-peasy';

interface Todo {
  id: number;
  text: string;
}

type CountSelector = Selector<TodosModel, number, [Array<Todo>], void>;

interface TodosModel {
  items: Array<Todo>;
  count: CountSelector;
  getById: Selector<TodosModel, Todo | undefined, [Array<Todo>], [number]>;
  unTypedArgs: Selector<TodosModel>;
}

interface StatusModel {
  totalTodos: Selector<
    StatusModel,
    number,
    [SelectorRef<CountSelector>],
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
    count: selector([state => state.items], ([items]) => {
      return items.length;
    }),
    getById: selector([state => state.items], ([items], [id]) => {
      return items.find(x => x.id === id);
    }),
    unTypedArgs: selector([state => state.items], ([items]) => items.length),
  },
  status: {
    totalTodos: selector(
      [(state, storeState) => storeState.todos.count],
      ([count]) => count(),
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

store.getState().todos.unTypedArgs('1');

store.getState().todos.unTypedArgs();
