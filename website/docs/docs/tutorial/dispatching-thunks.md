# Dispatching thunks

[Thunks](/docs/api/thunk) are accessed and dispatched in the exact same way as normal [actions](/docs/api/action); via the [useStoreActions](/docs/api/use-store-actions) hook.

```javascript
import { useStoreActions } from 'easy-peasy';

function FetchTodosButton() {
  const fetchTodos = useStoreActions(actions => actions.todos.fetch);
  return (
      <button onClick={() => fetchTodos()}>
        Fetch todos from server
      </button>
  );
}
```

And like [actions](/docs/api/action), you can also provide a payload to [thunks](/docs/api/thunk), which will be provided to the [thunk](/docs/api/thunk) handler that you defined on your model.

```javascript
const saveTodo = useStoreActions(actions => actions.todos.save);

saveTodo('Learn easy peasy');
```

## Dispatching thunks directly via the store

Again, you can dispatch [thunks](/docs/api/thunk) against the [store](/docs/api/store) in the same manner as you would a normal action.

```javascript
store.getActions().todos.saveTodo('Learn easy peasy');
```

## Thunks are asynchronous

There is an important distintion to be made of [thunks](/docs/api/thunk) compared to [actions](/docs/api/action). [Thunks](/docs/api/thunk) are executed asynchronously, _always_ returning a `Promise`.

This is especially important in the cases that you would like to execute some code after the [thunk](/docs/api/thunk) has completed. In this case you would need to wait for the `Promise` that is returned to resolve.

For example, if you wanted to inspect the state changes that occurred after your [thunk](/docs/api/thunk) completed you would have to do the following.

```javascript
store.getActions().todos.saveTodo('Learn easy peasy')
  .then(() => {
    console.log(store.getState());
  });
```

This mechanism is useful within your React components. For example you may use a [thunk](/docs/api/thunk) to handle a form submission (e.g. login), and then perform a redirect after the [thunk](/docs/api/thunk) has completed.

## Debugging Thunks

[Thunks](/docs/api/thunk) represent asynchronous execution that have no effect on state, however, we believed it would be useful to dispatch [actions](/docs/api/action) that represented the various states of a [thunk](/docs/api/thunk); *started*, *completed*, or *failed*. These dispatched actions have no effect on your state, however, they are still very useful.

Dispatching these actions results in the following benefits:

1. Increased debugging experience, with greater visibility of asynchronous flow of [thunks](/docs/api/thunk) in relation to your standard [actions](/docs/api/action) being dispatched
2. Enables listeners to be attached to specific [thunk](/docs/api/thunk) states (i.e. *started*, *completed*, or *failed*)

Using the [Redux Dev Tools](https://github.com/zalmoxisus/redux-devtools-extension) extension you will be able see your dispatched [thunks](/docs/api/thunk) as they flow through each of their states. You will also see the payload that was provided to the [thunk](/docs/api/thunk).

<img src="../../assets/devtools-thunk.png" />