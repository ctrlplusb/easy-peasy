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

  - `payload` (any, *optional*)

    The payload, if any, that was provided to the thunk when it was dispatched.

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

        - parent (Array, string, required)

          An array representing the path of the parent against which the thunk
          was attached within your model.

        - path (Array, string, required)

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

## Examples

### Integrated example

This is a fully integrated example show how you can declare and use a thunk.

```javascript
import { action, createStore, thunk, useStoreActions } from 'easy-peasy';

const store = createStore({
  session: {
    user: undefined,
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
  const onLoginClick = useCallback(() => {
    login({ username, password })
      .then(() => {
        window.location = '/dashboard';
      })
  }, [username, password]);
  return <button onClick={onLoginClick}>Login</button>
}
```

### Using local state

In this example our thunk will use the state that is local to it.

```javascript
import { createStore, thunk } from 'easy-peasy';

const store = createStore({
  counter: {
    count: 1,
    debug: thunk(async (actions, payload, { getState }) => {
      console.log(getState().count);
      // 1
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

### Dispatching an action on another part of your model

In this example we will dispatch an action that belongs to another part of your
model. We don't recommend doing this, and instead encourage you to use the
[listen](#todo) API, which promotes a better separation of concerns.

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

### Dependency injection

In this example we will consume a helper that was injected via the store
configuration.

```javascript
import { createStore, thunk } from 'easy-peasy';
import api from './api'

const model = {
  foo: 'bar',
  doSomething: thunk(async (dispatch, payload, { injections }) => {
    const { api } = injections
    await api.foo()
  }),
};

const store = createStore(model, {
  injections: {
    api,
  }
});
```