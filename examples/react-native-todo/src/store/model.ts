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

export interface Todo {
  text: string;
  done: boolean;
}

export interface TodosModel {
  todos: Todo[];

  completedTodos: Computed<this, Todo[]>;
  remainingTodos: Computed<this, Todo[]>;
  completedCount: Computed<this, number>;
  totalCount: Computed<this, number>;

  addTodo: Action<this, Todo>;
  toggleTodo: Action<this, string>;

  onTodosChanged: ThunkOn<this>;
  saveTodos: Thunk<this, Todo[]>;
}

const todosStore: TodosModel = {
  todos: [
    {text: 'Buy groceries', done: false},
    {text: 'Walk the dog', done: true},
    {text: 'Finish the report', done: false},
    {text: 'Call the dentist', done: true},
    {text: 'Pay the bills', done: false},
    {text: 'Clean the kitchen', done: true},
    {text: 'Send the email', done: false},
    {text: 'Pick up the kids', done: false},
    {text: 'Cook dinner', done: true},
    {text: 'Exercise', done: false},
  ],

  completedTodos: computed(state => state.todos.filter(todo => todo.done)),
  remainingTodos: computed(state => state.todos.filter(todo => !todo.done)),

  totalCount: computed(state => state.todos.length),
  completedCount: computed(state => state.completedTodos.length),

  addTodo: action((state, payload) => {
    state.todos.push(payload);
  }),

  // known limitation: text must be unique
  toggleTodo: action((state, text) => {
    const updatedTodos = state.todos.map(todo =>
      todo.text === text ? {...todo, done: !todo.done} : todo,
    );
    state.todos = updatedTodos;
  }),

  onTodosChanged: thunkOn(
    actions => [actions.addTodo, actions.toggleTodo],
    (actions, payload, {getState}) => {
      console.log('onTodosChanged triggered by ', payload);
      actions.saveTodos(getState().todos);
    },
  ),

  saveTodos: thunk((actions, todosToSave) => {
    setTimeout(
      () =>
        console.log(
          `Imagine we're sending ${todosToSave.length} todos to a remote server..`,
        ),
      1000,
    );
  }),
};

export default todosStore;
