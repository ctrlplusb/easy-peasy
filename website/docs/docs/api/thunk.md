# thunk

Declares a [thunk](docs/api/thunk.html) action on your model. [Thunks](docs/api/thunk.html) cannot modify state directly, however, they can dispatch [actions](/docs/api/action.html) to do so.

[Thunks](docs/api/thunk.html) are typically used to encapsulate side effects or complex workflow (e.g. `if/else` based logic) around action dispatching. They can be asynchronous or synchronous.

When you use `async/await` or return a `Promise` from your [thunk](docs/api/thunk.html), Easy Peasy will wait for the asynchronous work to complete prior to firing any listeners that are targeting the [thunk](docs/api/thunk.html).

Another interesting property of [thunks](docs/api/thunk.html) is that any value that is returned from a [thunk](docs/api/thunk.html) will be provided to the caller - i.e. where it was dispatched from. Therefore if you were using `async/await`, or returned a `Promise`, from your [thunk](docs/api/thunk.html) the caller would be able to chain off the returned `Promise` to know when the [thunk](docs/api/thunk.html) has completed execution.

```javascript
thunk(async (actions, payload) => {
  const user = await loginService(payload);
  actions.loginSucceeded(user);
})
```


## Arguments

  - `handler` (Function, *required*)

    The handler for your [thunk](/docs/api/thunk.html). It will receive the following arguments:

    - `actions` (Object)

      The [actions](/docs/api/action.html) that are local to the thunk. This allows you to dispatch an [action](/docs/api/action.html) to update state should you require.

    - `payload` (any)

      If a payload was provided to the thunk when it was dispatch it will be available via this argument.

    - `helpers` (Object)

      Helpers which may be useful for more advanced thunk implementations. It contains the following properties:

      - `dispatch` (Function)

        The Redux dispatch function, allowing you to dispatch "standard" Redux actions.

      - `getState` (Function)

        When executed it will provide the state that is local to the thunk.

        > Note: whilst you are able to access the store's state via this API your thunk should not perform any mutation of this state. That would be considered an anti-pattern. All state updates must be contained within [actions](/docs/api/action.html). This API exists within a thunk purely for convenience sake - allowing you to perform logic based on the existing state.

      - `getStoreActions` (Function)

        When executed it will get the [actions](/docs/api/action.html). i.e. all of the [actions](/docs/api/action.html) across your entire store.

        We don't recommend dispatching actions like this, and invite you to consider creating an [actionOn](/docs/api/action-on.html) or [thunkOn](/docs/api/thunk-on.html) listener instead.

      - `getStoreState` (Function)

        When executed it will provide the entire state of your store.

        > Note: whilst you are able to access the store's state via this API your thunk should not perform any mutation of this state. That would be considered an anti pattern. All state updates must be contained within actions. This API exists within a thunk purely for convenience sake - allowing you to perform logic based on the existing state.

      - `injections` (Any, default=undefined)

        Any dependencies that were provided to the `createStore` configuration
        will be exposed via this argument. See the [StoreConfig](/docs/api/store-config.html)
        documentation on how to provide them to your store.

      - `meta` (Object)

        This object contains meta information related to the thunk. Specifically it
        contains the following properties:

          - parent (Array)

            An array representing the path of the parent against which the thunk
            was attached within your model.

          - path (Array)

            An array representing the full path to the thunk based on where it
            was attached within your model.

## Asynchronous Execution

To enable a [thunk](/docs/api/thunk.html) to be asynchronous simply use `async/await` or return a `Promise` from your [thunk](/docs/api/thunk.html).  Doing this allows you to manage asynchronous calls to APIs for example.

```javascript
const todosModel = {
  todos: [],
  savedTodo: action((state, payload) => {
    state.todos.push(payload);
  }),
  //     👇 our asynchronous thunk makes use of async/await
  saveTodo: thunk(async (actions, payload) => {
    const saved = await todoService.save(payload);
    actions.addTodo(saved);
  })
};
```

An asynchronous [thunk](/docs/api/thunk.html) will have its `Promise` returned to the code that dispatched the [thunk](/docs/api/thunk.html). This is especially important in the cases that you would like to execute some code after the [thunk](/docs/api/thunk.html) has completed.

```javascript
function MyComponent() {
  const saveTodo = useStoreActions(actions => actions.todos.saveTodo);
  const onSaveClick = useCallback(
    // We chain on the promise returned by dispatching the thunk
    //                                  👇
    () => saveTodo('Learn easy peasy').then(() => {
      // redirect on success
      history.push('/done');
    }),
    [saveTodo]
  );
}
store.getActions().todos.
```

> **Note:** If you are using a `Promise` within your thunk, rather than `async/await`, you need to ensure that you return the `Promise` from your thunk so that Easy Peasy is able to track it internally.

## Synchronous Execution

[Thunks](/docs/api/thunk.html) can also be synchronous, which is useful for encapsulating logic around action dispatching.

```javascript
thunk((actions, payload) => {
  if (payload.valid) {
    actions.doValid();
  } else {
    actions.doInvalid();
  }
})
```

## Debugging Thunks

[Thunks](/docs/api/thunk.html) represent asynchronous execution that have no effect on state, however, we believed it would be useful to dispatch [actions](/docs/api/action.html) that represented the various states of a [thunk](/docs/api/thunk.html); *started*, *completed*, or *failed*. These dispatched actions have no effect on your state, however, they are still very useful.

Dispatching these actions results in the following benefits:

1. Increased debugging experience, with greater visibility of asynchronous flow of [thunks](/docs/api/thunk.html) in relation to your standard [actions](/docs/api/action.html) being dispatched
2. Enables listeners to be attached to specific [thunk](/docs/api/thunk.html) states (i.e. *started*, *completed*, or *failed*)

Using the [Redux Dev Tools](https://github.com/zalmoxisus/redux-devtools-extension) extension you will be able see your dispatched [thunks](/docs/api/thunk.html) as they flow through each of their states. You will also see the payload that was provided to the [thunk](/docs/api/thunk.html).

<img src="../../assets/devtools-thunk.png" />

## Accessing state within a thunk

You can access the local state via `getState`, or the entire store state via `getStoreState`.

```javascript
import { createStore, thunk } from 'easy-peasy';

const store = createStore({
  counter: {
    count: 1,
    debug: thunk((actions, payload, { getState, getStoreState }) => {
      console.log(getState());
      console.log(getStoreState());
      // { count: 1 }
    }),
  }
});
```

Just remember, if you are executing actions within your [thunk](/docs/api/thunk.html) then you may need to call `getState` or `getStoreState` after the action if you need to see/use the updated state.

## Dispatching an action on another part of your model

In this example we will dispatch an action that belongs to another part of your model.

```javascript
import { action, createStore, thunk } from 'easy-peasy';

const store = createStore({
  audit: {
    logs: [],
    add: action((state, payload) => {
      audit.logs.push(payload);
    })
  },
  todos: {                                     👇
    saveTodo: thunk((actions, payload, { getStoreActions }) => {
      getStoreActions().audit.add('Added a todo');
    })
  }
});
```

We don't recommend doing the above, and instead encourage you to define an [actionOn](/docs/api/action-on.html) or [thunkOn](/docs/api/thunk-on.html) listener, which promotes a better separation of concerns.

## Dependency injection

In this example we will use injections to provide an API service to our thunk.

```javascript
const model = {
  saveTodo: thunk(async (dispatch, payload, { injections }) => {
    //                                              👆
    //                 |- Consuming the injections -|
    //                👇
    const { todosService } = injections;
    await todosService.save(payload);
  })
};

const store = createStore(model, {
  // 👇 injections are configured against the store
  injections: {
    todosService,
  }
});
```
