## Usage with Typescript

Easy Peasy has full support for Typescript, via its bundled definitions.

We announced our support for Typescript via [this Medium post](https://medium.com/@ctrlplusb/easy-typed-state-in-react-with-hooks-and-typescript-eacd32901f05).

The documentation below will be expanded into higher detail soon, but the combination of the Medium post and the below examples should be enough to get you up and running for now. If anything is unclear please feel free to post and issue and we would be happy to help.

We also have an [example repository](https://github.com/ctrlplusb/easy-peasy-typescript) which you can clone and run for a more interactive run through.

<details>
<summary>Firstly, you need to define a type that represents your model.</summary>
<p>

Easy Peasy exports numerous types to help you declare your model correctly.

```typescript

import { Action, Reducer, Thunk, Select } from 'easy-peasy'

interface TodosModel {
  items: Array<string>
  // represents a "select"
  firstItem: Select<TodosModel, string | void>
  // represents an "action"
  addTodo: Action<TodosModel, string>
}

interface UserModel {
  token?: string
  loggedIn: Action<UserModel, string>
  // represents a "thunk"
  login: Thunk<UserModel, { username: string; password: string }>
}

interface StoreModel {
  todos: TodosModel
  user: UserModel
  // represents a custom reducer
  counter: Reducer<number>
}
```

</p>
</details>

<details>
<summary>Then you create your store.</summary>
<p>

```typescript
// Note that as we pass the Model into the `createStore` function. This allows
// full type checking along with auto complete to take place
//                          👇
const store = createStore<StoreModel>({
  todos: {
    items: [],
    firstItem: select(state =>
      state.items.length > 0 ? state.items[0] : undefined,
    ),
    addTodo: action((state, payload) => {
      state.items.push(payload)
    }),
  },
  user: {
    token: undefined,
    loggedIn: action((state, payload) => {
      state.token = payload
    }),
    login: effect(async (dispatch, payload) => {
      const response = await fetch('/login', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const { token } = await response.json()
      dispatch.user.loggedIn(token)
    }),
  },
  counter: reducer((state = 0, action) => {
    switch (action.type) {
      case 'COUNTER_INCREMENT':
        return state + 1
      default:
        return state
    }
  }),
})
```

</p>
</details>

<details>
<summary>The store's APIs will be typed</summary>
<p>

```typescript
console.log(store.getState().todos.firstItem)

store.dispatch({ type: 'COUNTER_INCREMENT' })

store.dispatch.todos.addTodo('Install typescript')
```

</p>
</details>

<details>
<summary>You can type your hooks too.</summary>
<p>

``` typescript
import { useStoreState, useStoreActions, Actions, State } from 'easy-peasy';
import { StoreModel } from './your-store';

function MyComponent() {
  const token = useStoreState((state: State<StoreModel>) =>
    state.user.token
  )
  const login = useStoreActions((actions: Actions<StoreModel>) =>
	  actions.user.login,
  )
  return (
    <button onClick={() => login({ username: 'foo', password: 'bar' })}>
      {token || 'Log in'}
    </button>
  )
}
```

The above can become a bit cumbersome - having to constantly provide your types to the hooks. Therefore we recommend using the bundled `createTypedHooks` helper in order to create pre-typed versions of the hooks.

```typescript
// hooks.js

import { createTypedHooks } from "easy-peasy";
import { StoreModel } from "./model";

export default createTypedHooks<StoreModel>();
```

We could then revise our previous example.

``` typescript
import { useStoreState, useStoreActions } from './hooks';

function MyComponent() {
  const token = useStoreState((state) => state.user.token)
  const login = useStoreActions((actions) => actions.user.login)
  return (
    <button onClick={() => login({ username: 'foo', password: 'bar' })}>
      {token || 'Log in'}
    </button>
  )
}
```

That's far cleaner - and it's still fully type checked.

</p>
</details>

<details>
<summary>We also support typing `react-redux` based integrations.</summary>
<p>

```typescript
const Counter: React.SFC<{ counter: number }> = ({ counter }) => (
  <div>{counter}</div>
)

connect((state: State<StoreModel>) => ({
  counter: state.counter,
}))(Counter)
```

</p>
</details>

<p>&nbsp;</p>

---


## Typescript API

### Actions<Model = {}>

Creates a type that represents the actions for a model.

<details>
<summary>Example</summary>
<p>

```typescript
import { Actions } from 'easy-peasy';

type ModelActions = Actions<MyStoreModel>;
```

</p>
</details>

### Action<Model = {}, Payload = any>

Represents an `action`, useful when defining your model interface.

<details>
<summary>Example</summary>
<p>

```typescript
import { Action, action } from 'easy-peasy';

interface Todos {
  items: string[];
  add: Action<Todos, string>;
}

const todos: Todos = {
  items: [],
  add: action((state, payload) => {
    state.items.push(payload);
  })
};
```

</p>
</details>

### Listen<Model = {}, Injections = any, StoreModel = {}>

Represents a `listen`, useful when defining your model interface.

<details>
<summary>Example</summary>
<p>

```typescript
import { Listen, listen } from 'easy-peasy';

interface Audit {
  logs: string[];
  listen: Listen<Audit>;
}

const audit: Audit = {
  logs: [],
  listen: (on) => {
    on('ROUTE_CHANGED', action((state, payload) => {
      state.logs.push(payload.path);
    }));
  },
};
```

</p>
</details>

### Reducer<State = any, Action = ReduxAction>

Represents a `reducer`, useful when defining your model interface.

<details>
<summary>Example</summary>
<p>

```typescript
import { Reducer, reducer } from 'easy-peasy';
import { RouterState, routerReducer } from 'my-router-solution';

interface Model {
  router: Reducer<RouterState>;
}

const model: Model = {
  router: reducer(routerReducer)
};
```

</p>
</details>

### Select<Model = {}, Result = any>

Represents a `select`, useful when defining your model interface.

<details>
<summary>Example</summary>
<p>

```typescript
import { Select, select } from 'easy-peasy';

interface Todos {
  items: string[];
  firstTodo: Select<Todos, string | undefined>;
}

const todos: Todos = {
  items: [],
  firstTodo: select((state) => {
    return state.items.length > 0 ? state.items[0] : undefined;
  })
};
```

</p>
</details>

### Thunk<Model = {}, Payload = void, Injections = any, StoreModel = {}, Result = any>

Represents a `thunk`, useful when defining your model interface.

<details>
<summary>Example</summary>
<p>

```typescript
import { Thunk, thunk } from 'easy-peasy';

interface Todos {
  items: string[];
  saved: Action<Todos, string>;
  save: Thunk<Todos, string>;
}

const todos: Todos = {
  items: [],
  saved: action((state, payload) => {
    state.items.push(payload);
  }),
  save: thunk(async (actions, payload) => {
    await saveTodo(payload);
    actions.saved(payload);
  })
};
```

</p>
</details>

---

