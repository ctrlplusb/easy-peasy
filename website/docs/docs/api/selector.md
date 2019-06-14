# selector

Allows you to define a selector against your model. Selectors are used to derive state, and are optimised in a manner to ensure that your React components do not re-render unnecessarily when consuming derived state.

```javascript
selector(
  [state => state.products],
  (resolvedState) => {
    const [products] = resolvedState;
    return products.length;
  }
)
```

## Arguments

  - `stateResolvers` (Array, *required*)

    An array of functions responsible for resolving the state that will be used
    to derive against. Each function receives the following arguments:

    - `state` (Object)

      The local state against which the selector was bound.

    - `storeState` (Object)

      The entire state of your store.

    ```javascript
    (state, storeState) => state.foo
    ```

    It is best to keep your state resolvers as simple as possible. They should only isolate the state that will be used in the deriving process.

  - `selector` (Function, *required*)

    The selector implementation that consumes the resolved state and produces the derived state. It is provided the following arguments:

    - `resolvedState` (Array)

      These are the results of the state resolved by your `stateResolvers` array. Each value matches the index of the respective state resolver.

    - `runtimeArguments` (Array)

      If any runtime arguments were provided to your selector, they will be contained within this array.

  - `configuration` (Object, *optional*)

    The configuration for your selector. It currently supports the following properties:

    - `limit` (number, *optional*, default=1)

      The size of the cache for your selector. By default only the most recent result of your selector will be cached.

      This configuration value is only useful for selectors that accept runtime arguments. For example, imagine a `productById` selector. You may make multiple calls to this selector across a render cycle of your React application. It would be wasteful to have a maximum cache size of 1, especially in cases where you expect to query for multiple products at a time. For these cases it is highly recommended to increase the cache limit. For example you could choose to increase the cache limit to 100, in
      which case the 100 most recent unique argument calls to `productById` would be cached.

## Simple Example

```javascript
import { selector } from 'easy-peasy';

const store = createStore({
  todos: {
    items: [{ id: 1, text: 'Learn easy peasy' }],
    next: selector(
      [state => state.items],
      (resolvedState) => {
        const [items] = resolvedState;
        return items.length > 0 ? items[0] : undefined;
      }
    )
  }
});

function NextTodo() {
  //     Note that you have to execute a selector  👇
  const todo = useStoreState(state => state.todos.next());
  return todo
    ? <Todo todo={todo} />
    : null;
}
```

## Multiple state resolvers

In this example we will use multiple bits of state in the deriving selector.

```javascript
import { selector } from 'easy-peasy';

const store = createStore({
  profile: {
    firstName: 'Isla',
    lastName: 'Rose',
    fullName: selector(
      [state => state.firstName, state => state.lastName],
      (resolvedState) => {
        const [firstName, lastName] = resolvedState;
        return `${firstName} ${lastName}`;
      }
    )
  }
});
```

## Using global state

In this example we will resolve some global state to be used within the deriving process.

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
       //         👇 note the 2nd arg to our state resolved is the global state
       (state, storeState) => storeState.todos.items
     ],
     (resolvedState) => {
       const [todoId, todos] = resolvedState;
       return todos[todoId];
     }
    )
  }
});
```

## Providing runtime arguments

In this example we will provide runtime arguments to our selector.

```javascript
const store = createStore({
  todos: {
    items: [
      { id: 1, text: 'Win the lottery' }
    ],
    getById: selector(
      [state => state.items],
      // Runtime args received 👇
      (stateResolvers, runtimeArgs) => {
        const [items] = stateResolvers;
        const [id] = runtimeArgs;
        return items.find(todo => todo.id === id);
      }
    )
  }
});

function Todo({ id }) {
  const todo = useStoreState(
    // Providing a runtime arg   👇
    state => state.todos.getById(id),
    [id]
  );
  return todo
    ? <div>{todo.text}</div>
    : null;
}
```

In the example above we are passing a prop into our selector, thereby exposing it as a runtime argument to our [selector](/docs/api/selector). It's important to note that as we are depending on an external value, the `id` prop, we had to declare it as a dependency to our [useStoreState](/docs/api/use-store-state) hook. This ensures that the map state will be executed any time that the `id` changes.

## Customising the cache limit

In this example we will customise the cache size for our selector.

```javascript
const store = createStore({
  todos: {
    items: [
      { id: 1, text: 'Win the lottery' }
    ],
    getById: selector(
      [state => state.items],
      (stateResolvers, runtimeArgs) => {
        const [items] = stateResolvers;
        const [id] = runtimeArgs;
        return items.find(todo => todo.id === id);
      },
      { limit: 10 }  // 👈 set the limit
    )
  },
});

store.getState().todos.getById(1); // new cache item created
store.getState().todos.getById(2); // new cache item created
store.getState().todos.getById(1); // cached item returned
store.getState().todos.getById(2); // cached item returned
```

## Calling another selector

It is possible to reference another selector. To do so you need to resolve the required selector using the state resolvers.

```javascript
const store = createStore({
  todos: {
    items: [
      { id: 1, text: 'Win the lottery' }
    ],
    //  👇 we are going to call this selector from the one below
    getById: selector(
      [state => state.items],
      (stateResolvers, runtimeArgs) => {
        const [items] = stateResolvers;
        const [id] = runtimeArgs;
        return items.find(todo => todo.id === id);
      }
    ),
  },
  profile: {
    favouriteTodoId: 1,
    favouriteTodo: selector(
      [
        state => state.favouriteTodoId,
        // we resolve the required selector here  👇
        (state, storeState) => storeState.todos.getById
      ],
      (resolvedState) => {
        const [favouriteTodoId, getTodoById] = resolvedState;
        // and now we can call it here
        //         👇
        return getTodoById(favouriteTodoId);
      }
    )
  }
});
```
