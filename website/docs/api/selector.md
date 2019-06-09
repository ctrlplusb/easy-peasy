# selector

Allows you to define a selector against your model. Selectors are used to derive
state, and are optimised in a manner to ensure that your React components do not
rerender unnecessarily when you required derived state.

```javascript
selector(
  [state => state.products],
  ([products]) => products.length
)
```

## Arguments

  - `stateResolvers` (Array, required)

    An array of functions responsible for resolving the state that will be used
    to derive against. Each function receives the following arguments:

    - `state` (Object)

      The local state against which the selector was bound.

    - `storeState` (Object)

      The entire state of your store.

    ```javascript
    (state, storeState) => state.foo
    ```

    It is best to keep your state resolveds as simple as possible. Keep the
    heavy lifting  / deriving to the selector function.

  - `selector` (Function, required)

    The selector function responsible for resolving the derived state. It is
    provided the following arguments:

    - `resolvedState` (Array, required)

      These are the results of the state resolved by your `stateResolvers`. Each
      value matches the idx of the respective state resolver.

    - `runtimeArguments` (Array, required)

      If any runtime arguments were provided to your selector, they will be
      contained within this array.

  - `configuration` (Object, not required)

    The configuration for your selector. It currently supports the following
    properties:

    - `limit` (number, not required, default=1)

      The size of the cache for your selector. By default only the most recent
      result of your selector will be cached.

      If your selector gets executed with arguments that do not match the previous arguments that it received provided, then it will be rexecuted and the
      new result will be cached.

      This configuration value is only useful for selectors that accept runtime
      arguments. For example, imagine a `productById` selector. You may make
      multiple calls to this selector across a render cycle of your React
      application. It would be wasteful to have a maximum cache size of 1,
      especially in cases where you expect to query for multiple products at
      a time. For these cases it is highly recommended to increase the cache
      limit. For example you could choose to increase the cache limit to 100, in
      which case the 100 most recent unique argument calls to `productById` would
      be cached.

## Examples

### Integrated example

```javascript
import { selector } from 'easy-peasy';

const store = createStore({
  todos: {
    items: [{ id: 1, text: 'Learn easy peasy' }],
    first: selector(
      [state => state.items],
      ([items]) => items.length > 0 ? items[0] : undefined
    )
  }
});

function NextTodo() {
  const next = useStoreState(state => state.todos.first());
  return next
    ? <Todo todo={next} />
    : null;
}
```

### Multiple state resolvers

In this example we will use multiple bits of state in the deriving selector.

```javascript
import { selector } from 'easy-peasy';

const store = createStore({
  profile: {
    firstName: 'Isla',
    lastName: 'Rose',
    fullName: selector(
      [state => state.firstName, state => state.lastName],
      ([firstName, lastName]) => `${firstName} ${lastName}`
    )
  }
});
```

### Using global state

In this example we will resolve some global state to be used within the
deriving selector.

```javascript
const store = createStore({
  todos: {
    items: {
      1: { id: 1, text: 'Win the lottery' }
    }
  },
  profile: {
    favouriteTodoId: 1,
    favouriteTodo: selector(
     [
       state => state.favouriteTodoId,
       (state, storeState) => storeState.todos.items
     ],
     ([todoId, todos]) => todos[todoId]
    )
  }
});
```

### Providing runtime arguments

In this example we will provide runtime arguments to our selector.

```javascript
const store = createStore({
  todos: {
    items: [
      { id: 1, text: 'Win the lottery' }
    ],
    getById: selector(
      [state => state.items],
      ([items], [id]) => items.find(todo => todo.id === id)
    )
  }
});

function Todo({ id }) {
  const todo = useStoreState(
    state => state.todos.getById(id),
    [id]
  );
  return todo
    ? <div>{todo.text}</div>
    : null;
}
```

### Customising the cache limit

In this example we will customise the cache size for our selector.

```javascript
const store = createStore({
  todos: {
    items: [
      { id: 1, text: 'Win the lottery' }
    ],
    getById: selector(
      [state => state.items],
      ([items], [id]) => items.find(todo => todo.id === id),
      { limit: 100 }
    )
  },
});

store.getState().todos.getById(1); // new cache item created
store.getState().todos.getById(2); // new cache item created
store.getState().todos.getById(1); // cached item returned
store.getState().todos.getById(2); // cached item returned
```

### Calling another selector

In this example we will call a different selector from a selector.

```javascript
const store = createStore({
  todos: {
    items: [
      { id: 1, text: 'Win the lottery' }
    ],
    getById: selector(
      [state => state.items],
      ([items], [id]) => items.find(todo => todo.id === id)
    ),
  },
  profile: {
    favouriteTodoId: 1,
    favouriteTodo: selector(
     [
       state => state.favouriteTodoId,
       (state, storeState) => storeState.todos.getById
     ],
     ([favouriteTodoId, getTodoById]) => getTodoById(favouriteTodoId)
    )
  }
});
```
