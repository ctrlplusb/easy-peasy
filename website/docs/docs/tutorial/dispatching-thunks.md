# Dispatching thunks

[Thunks](/docs/api/thunk) are accessed and dispatched in the exact same way as normal [actions](/docs/api/action); via the [useStoreActions](/docs/api/use-store-actions) hook.

```javascript
import { useStoreActions } from 'easy-peasy';

function FetchTodosButton() {
  const fetchTodos = useStoreActions(actions => actions.todos.fetch);
  return (
    // Dispatching of the thunk here
    //                          👇
    <button onClick={() => fetchTodos()}>
      Fetch todos from server
    </button>
  );
}
```

And like [actions](/docs/api/action), you can also provide a payload to [thunks](/docs/api/thunk), which will be provided to the [thunk](/docs/api/thunk) handler that you defined on your model.

## Dispatching thunks directly via the store

Again, you can dispatch [thunks](/docs/api/thunk) against the [store](/docs/api/store) in the same manner as you would a normal action.

```javascript
store.getActions().todos.saveTodo('Learn easy peasy');
```
