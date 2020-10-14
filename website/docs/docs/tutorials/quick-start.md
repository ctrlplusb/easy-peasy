# Quick Start

A no frills, no fuss, introduction the "core" APIs of Easy Peasy. Perfect for
the newcomer.

- [Create the store](#create-the-store)
- [Binding the store to your React app](#binding-the-store-to-your-react-app)
- [Using state in your components](#using-state-in-your-components)
- [Defining actions to perform state updates](#defining-actions-to-perform-state-updates)
- [Dispatching actions](#dispatching-actions)
- [Encapsulating side effects via thunks](#encapsulating-side-effects-via-thunks)
- [Dispatching thunks within your components](#dispatching-thunks-within-your-components)
- [Deriving state via computed properties](#deriving-state-via-computed-properties)
- [Using computed properties](#using-computed-properties)
- [Persisting state](#persisting-state)

## Create the store

Define your store by providing a plain old JavaScript object based model to the
[createStore](/docs/api/create-store.html) function.

```javascript
import { createStore } from 'easy-peasy';

const store = createStore({
  todos: [],
});
```

> Note: Your model can be as complex/nested as you like. Feel free to compose it
> from imports as your state structure scales in complexity.

## Binding the store to your React app

Surround your application with the
[StoreProvider](/docs/api/store-provider.html) component, providing it your
[store](/docs/api/store.html) instance.

```javascript
import { StoreProvider } from 'easy-peasy';
import { store } from './store';

ReactDOM.render(
  <StoreProvider store={store}>
    <App />
  </StoreProvider>,
  rootEl,
);
```

## Using state in your components

The [useStoreState](/docs/api/use-store-state.html) hook allows you to access
your store's state.

```javascript
import { useStoreState } from 'easy-peasy';

function Todos() {
  const todos = useStoreState((state) => state.todos);
  return (
    <ul>
      {todos.map((todo) => (
        <li>{todo.text}</li>
      ))}
    </ul>
  );
}
```

## Defining actions to perform state updates

Place an [action](/docs/api/action.html) within your model to support updates.

```javascript
import { createStore, action } from 'easy-peasy';

const store = createStore({
  todos: [],
  addTodo: action((state, payload) => {
    state.todos.push({ text: payload, done: false });
  }),
});
```

The [action](/docs/api/action.html) will receive the state which is local to it.
Update the state by directly mutating the `state` argument.

> Don't worry, under the hood we will convert the operation into an immutable
> update against your store by using [Immer](https://github.com/immerjs/immer).

## Dispatching actions

The [useStoreActions](/docs/api/use-store-actions.html) hook allows you to
access [actions](/docs/api/action.html) from your components.

```javascript
import { useStoreActions } from 'easy-peasy';

function AddTodoForm() {
  const addTodo = useStoreActions((actions) => actions.addTodo);
  const [value, setValue] = React.useState('');
  return (
    <>
      <input onChange={(e) => setValue(e.target.value)} value={value} />
      <button onClick={() => addTodo(value)}>Add Todo</button>
    </>
  );
}
```

In this example, we resolve the `addTodo` action, and bind it to the click of
the "Add Todo" button. When the button is clicked it will dispatch the `addTodo`
action, providing the text of the new todo item as the payload.

## Encapsulating side effects via thunks

[Thunks](/docs/api/thunk.html) provide us with the capability to encapsulate
side effects, whilst also having the ability to dispatch actions in order to
update our state accordingly.

```javascript
import { action, thunk } from 'easy-peasy';

const model = {
  todos: [],
  addTodo: action((state, payload) => {
    state.todos.push(payload);
  }),
  saveTodo: thunk(async (actions, payload) => {
    const { data } = await axios.post('/todos', payload);
    actions.addTodo(data);
  }),
};
```

Within our thunk we execute an API request. We subsequently utilize the returned
data, dispatching the `addTodo` action to update our state.

## Dispatching thunks within your components

Thunks are accessible in exactly the same manner as actions, i.e. via the
[useStoreActions](/docs/api/use-store-actions.html) hook.

```javascript
import { useStoreActions } from 'easy-peasy';

function AddTodoForm() {
  const saveTodo = useStoreActions((actions) => actions.saveTodo);
  const [value, setValue] = React.useState('');
  return (
    <>
      <input onChange={(e) => setValue(e.target.value)} value={value} />
      <button onClick={() => saveTodo(value)}>Add Todo</button>
    </>
  );
}
```

## Deriving state via computed properties

It is a common requirement within state management to need derived state. A
basket component might need to derive the total price. A paging component may
need the total number of items. There are many cases that can appear as your
application evolves.

You can create derived state via the [computed](/docs/api/computed.html) API.

```javascript
import { computed } from 'easy-peasy';

const store = createStore({
  todos: [{ text: 'Learn easy peasy', done: true }],
  completedTodos: computed((state) => state.todos.filter((todo) => todo.done)),
});
```

Easy Peasy will do all of the required optimization under the hood to keep your
computed properties as performant as possible.

## Using computed properties

[Computed](/docs/api/computed.html) properties are accessed just like any other
state.

```javascript
import { useStoreState } from 'easy-peasy';

function CompletdTodos() {
  const completedTodos = useStoreState((state) => state.completedTodos);
  return (
    <>
      {completedTodos.map((todo) => (
        <Todo todo={todo} />
      ))}
    </>
  );
}
```

## Persisting state

Should you wish to persist your state, or part of it, you can utilise the
[persist](/docs/api/persist.html) API to do so.

```javascript
import { persist } from 'easy-peasy';

const store = createStore(
  persist({
    count: 1,
    inc: action((state) => {
      state.count += 1;
    }),
  }),
);
```

This simple adjustment will make Easy Peasy save your store state into
`sessionStorage`. Easy Peasy will persist your state every time it changes.

The next time your store is created Easy Peasy will look for any persisted data
and use it to rehydrate your state if it exists.

This process is asynchronous, but you can utilise the
[useStoreRehydrated](/docs/api/use-store-rehydrated.html) hook to make sure the
rehydration has completed prior to rendering your components.

```javascript
import { useStoreRehydrated } from 'easy-peasy';

const store = createStore(persist(model));

function App() {
  const isRehydrated = useStoreRehydrated();
  return isRehydrated ? <Main /> : <div>Loading...</div>;
```
