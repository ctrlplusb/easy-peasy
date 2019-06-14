# thunk

Declares a thunk action on your model. A thunk typically encapsulates side effects (e.g. calls to an API). It is always executed asynchronously, returning a `Promise`. Thunks cannot modify state directly, however, they can dispatch other actions to do so.

```javascript
thunk(async (actions, payload) => {
  const user = await loginService(payload);
  actions.loginSucceeded(user);
})
```

## Arguments

  - `actions` (Object)

    The [actions](/docs/api/action) that are local to the thunk. This allows you to dispatch an [action](/docs/api/action) to update state should you require.

  - `payload` (any)

    If a payload was provided to the thunk when it was dispatch it will be available via this argument.

  - `helpers` (Object)

    Helpers which may be useful for more advanced thunk implementations. It contains the following properties:

    - `getState` (Function)

      When executed it will provide the state that is local to the thunk.

    - `getStoreActions` (Function)

      When executed it will get the [actions](/docs/api/action). i.e. all of the [actions](/docs/api/action) across your entire store.

      We don't recommend dispatching actions like this, and invite you to consider creating a *listener* [action](/docs/api/action) or [thunk](/docs/api/thunk), which instead promotes a reactive model and generally allows responsiblity to be at the right place.

    - `getStoreState` (Function)

      When executed it will provide the entire state of your store.

    - `injections` (Any, default=undefined)

      Any dependencies that were provided to the `createStore` configuration
      will be exposed via this argument. See the [`StoreConfig`](#storeconfig)
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

      For example:

      ```javascript
      const store = createStore({
        products: {
          fetchById: thunk((actions, payload, { meta }) => {
            console.log(meta);
            // {
            //   parent: ['products'],
            //   path: ['products', 'fetchById']
            // }
          })
        }
      });
      ```

## Example

This is a fully integrated example show how you can declare and use a thunk.

```javascript
import { action, createStore, thunk, useStoreActions } from 'easy-peasy';

const store = createStore({
  session: {
    user: undefined,
    //  👇 our thunk
    login: thunk(async (actions, payload) => {
      const user = await loginService(payload)
      actions.loginSucceeded(user)
    }),
    loginSucceeded: action((state, payload) => {
      state.user = payload
    })
  }
});

function LoginButton({ username, password }) {
  const login = useStoreActions(actions => actions.session.login);
  return (
    //                       👇 dispatch with a payload
    <button onClick={() => login({ username, password }))}>
      Login
    </button>
  );
}
```

## Listener thunk

It is possible to define a [thunk](/docs/api/thunk) as being a *listener* via the `listenTo` configuration property. A *listener* [thunk](/docs/api/thunk) will be fired every time that the *target* [action](/docs/api/action)/[thunk](/docs/api/thunk) successfully completes. The *listener* will receive the same payload that was provided to the *target*.

An example use case for this would be the need to clear some state when a user logs out of your application, or if you would like to create an audit trail for when certain [actions](/docs/api/action)/[thunks](/docs/api/thunk) are fired.

```javascript
const todosModel = {
  items: [],
  //  👇 the target action
  addTodo: action((state, payload) => {
    state.items.push(payload);
  })
};

const auditModel = {
  logs: [],
  // 👇 our listener thunk
  onAddTodo: thunk(
    async (actions, payload) => {
      await auditService.post(`Added todo: ${payload.text}`);
    },
    { listenTo: todosModel.addTodo } // 👈 declare the target to listen to
  )
};
```

In the example above note that the `onAddTodo` [thunk](/docs/api/thunk) has been provided a configuration, with the `addTodo` [action](/docs/api/action) being set as a target.

Any time the `addTodo` [action](/docs/api/action) completes successfully, the `onAddTodo` will be fired, receiving the same payload as what `addTodo` received.

## Accessing local state

In this example our thunk will use the state that is local to it.

```javascript
import { createStore, thunk } from 'easy-peasy';

const store = createStore({
  counter: {
    count: 1,
    debug: thunk(async (actions, payload, { getState }) => {
      console.log(getState());
      // { count: 1 }
    }),
  }
});
```

### Using global state

In this example our thunk will use the full state of our store.

```javascript
import { createStore, thunk } from 'easy-peasy';

const store = createStore({
  session: {
    username: 'mary',
  },
  counter: {
    count: 1,
    debug: thunk(async (actions, payload, { getStoreState }) => {
      const state = getStoreState();
      console.log(state);
      // { session: { username: 'mary' }, counter: { count: 1 } }
    }),
  }
});
```

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
  todos: {                                  👇
    saveTodo: thunk((actions, payload, { dispatch }) => {
      actions.audit.add('Added a todo');
    })
  }
});
```

We don't recommend doing the above, and instead encourage you to define a listener [action](/docs/api/action) or [thunk](/docs/api/thunk), which promotes a better separation of concerns.

## Dependency injection

In this example we will use an injected util provided to our store via the store configuration.

```javascript
import { createStore, thunk } from 'easy-peasy';
import api from './api'

const model = {
  foo: 'bar',
  doSomething: thunk(async (dispatch, payload, { injections }) => {
    //                                              👆
    //                 |- Consuming the injections -|
    //                👇
    const { api } = injections
    await api.foo()
  }),
};

const store = createStore(model, {
  // 👇 injections defined here
  injections: {
    api,
  }
});
```