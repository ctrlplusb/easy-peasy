# Dispatching thunks

Thunks are accessed and dispatched in the exact same way as normal actions; via
the `useStoreActions` hook.

```javascript
import { useStoreActions } from 'easy-peasy';

function FetchTodosButton() {
  const fetchTodos = useStoreActions(actions => actions.todos.fetch);
  return (<button onClick={() => fetchTodos()}>Fetch todos from server</button>);
};
```

And like actions, you can also provide a payload to thunks, which will be
provided to the thunk handler that you defined on your model.

```javascript
const saveTodo = useStoreActions(actions => actions.todos.save);

saveTodo('Learn easy peasy');
```

## Dispatching thunks directly via the store

Again, you can dispatch thunks against the store in the same manner as you
would a normal action.

```javascript
store.actions.todos.saveTodo('Learn easy peasy');
```

## Thunks are asynchronous

There is an important distintion to be made of thunks compared to actions. Thunks
are executed asynchronously and _always_ returns a `Promise`.

This is especially important in the cases that you would like to execute some
code after the thunk has completed. In this case you would need to wait for the
`Promise` that is returned to resolve.

For example, if you wanted to inspect the state changes that occurred after
your thunk completed you would have to do the following.

```javascript
store.actions.todos.saveTodo('Learn easy peasy')
  .then(() => {
    console.log(store.getState());
  });
```

This mechanism is useful within your React components. For example you may
use a thunk to handle a form submission (e.g. login), and then perform a
redirect after the thunk has completed.

## Debugging Thunks

Thunks represent asynchronous execution that have no effect on state, however, we believed it would be useful for actions to be automatically dispatched that represented the started/completed/failed states of a thunk. This results in the following benefits:

1. Increased debugging experience with greater visibility of asynchronous flow in relation to your standard actions being dispatched
2. Enables listeners to be attached to specific thunk events (e.g. started, completed, or failed)

Ensure you have the [Redux Dev Tools](https://github.com/zalmoxisus/redux-devtools-extension) extension installed. This will allow you to see your dispatched thunks as they flow through each of their states (started/completed/failed) along with their payload.

<img src="../../assets/devtools-thunk.png" />