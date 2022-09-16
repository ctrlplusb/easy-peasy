import {
  action,
  Action,
  computed,
  Computed,
  thunk,
  Thunk,
  thunkOn,
  ThunkOn,
} from 'easy-peasy';

interface Todo {
  text: string;
  done: boolean;
}

export interface TodosModel {
  todos: Todo[];

  completedTodos: Computed<this, Todo[]>;
  remainingTodos: Computed<this, Todo[]>;

  addTodo: Action<this, Todo>;
  toggleTodo: Action<this, Todo>;

  onTodosChanged: ThunkOn<this>;
  saveTodos: Thunk<this, Todo[]>;
}

const todosStore: TodosModel = {
  todos: [
    { text: 'Create store', done: true },
    { text: 'Wrap application', done: true },
    { text: 'Use store', done: true },
    { text: 'Add a todo', done: false },
  ],

  completedTodos: computed((state) => state.todos.filter((todo) => todo.done)),
  remainingTodos: computed((state) => state.todos.filter((todo) => !todo.done)),

  addTodo: action((state, payload) => {
    state.todos.push(payload);
  }),
  toggleTodo: action((state, todoToToggle) => {
    const updatedTodos = state.todos.map((todo) =>
      todo.text === todoToToggle.text ? { ...todo, done: !todo.done } : todo,
    );
    state.todos = updatedTodos;
  }),

  onTodosChanged: thunkOn(
    (actions) => [actions.addTodo, actions.toggleTodo],
    (actions, payload, { getState }) => {
      console.log(`onTodosChanged triggered by `, payload);
      actions.saveTodos(getState().todos);
    },
  ),
  saveTodos: thunk((actions, todosToSave) => {
    console.log(`Imagine were sending ${todosToSave.length} todos to a remote server..`);
  }),
};

export default todosStore;
