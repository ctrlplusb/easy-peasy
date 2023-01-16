# Primary API

This tutorial will provide you with an indepth insight into the "core" APIs of
Easy Peasy. Usage of these APIs are considered enough to satisfy 90% of the
state requirements\* for React applications.

> \* don't quote me on that 😅

- [Primary API](#primary-api)
  - [Introducing the Model](#introducing-the-model)
  - [State](#state)
    - [State type restrictions](#state-type-restrictions)
  - [Actions](#actions)
    - [Arguments](#arguments)
    - [Modifying the state](#modifying-the-state)
    - [Scoping Actions](#scoping-actions)
    - [Bad Practices](#bad-practices)
      - [1. Don't destructure the `state` argument](#1-dont-destructure-the-state-argument)
      - [2. Don't execute any side effects within your action](#2-dont-execute-any-side-effects-within-your-action)
  - [Creating a Store](#creating-a-store)
    - [Some fun facts about the store](#some-fun-facts-about-the-store)
      - [1. It's a Redux store](#1-its-a-redux-store)
      - [2. It's a Redux store](#2-its-a-redux-store)
      - [3. It's not just a Redux store](#3-its-not-just-a-redux-store)
  - [Connecting the Store](#connecting-the-store)
  - [Using the Store](#using-the-store)
    - [The `useStoreState` hook](#the-usestorestate-hook)
      - [Important note on selector optimization](#important-note-on-selector-optimization)
    - [The `useStoreActions` hook](#the-usestoreactions-hook)
  - [Thunks](#thunks)
    - [Defining thunks](#defining-thunks)
    - [Dispatching thunks](#dispatching-thunks)
    - [Some interesting information about thunks](#some-interesting-information-about-thunks)
      - [1. You should handle errors within your thunk](#1-you-should-handle-errors-within-your-thunk)
      - [2. Thunks can also be synchronous](#2-thunks-can-also-be-synchronous)
      - [3. Thunks can also dispatch other thunks](#3-thunks-can-also-dispatch-other-thunks)
      - [4. Thunks can access the store state](#4-thunks-can-access-the-store-state)
      - [5. You can return data out of a thunk](#5-you-can-return-data-out-of-a-thunk)
  - [Computed Properties](#computed-properties)
    - [Defining a computed property](#defining-a-computed-property)
    - [Further insights into computed properties](#further-insights-into-computed-properties)
      - [1. They are hyper optimized](#1-they-are-hyper-optimized)
      - [2. You can make them accept runtime arguments](#2-you-can-make-them-accept-runtime-arguments)
      - [3. Only use them to derive state, not execute side effects](#3-only-use-them-to-derive-state-not-execute-side-effects)

## Introducing the Model

Easy Peasy stores are based on model definitions.

Models are plain old javascript objects (POJOs) representing _everything_ about
your store - the state, the actions that can be performed on it, the
encapsulated side effects, computed properties etc

They can be as wide (lots of properties) or deep (lots of nested objects) as you
like.

We'll start off by demonstrating how to construct a model containing state and
the actions used to update the state.

## State

Below is a simple model with a basic state structure containing a list of todos.

```javascript
const model = {
  todos: [],
};
```

Given that models are just plain old javascript objects, you have a great deal
of flexibility in how you structure or compose your models. The next example
represents a structure that is closer to that of a real world use case.

```javascript
const model = {
  products: {
    byId: {},
  },
  basket: {
    productsInBasket: [],
  },
  userSession: {
    isLoggedIn: false,
    user: null,
  },
};
```

As your application scales you can refactor your model to be composed of
imports.

```javascript
import productsModel from './products-model';
import basketModel from './basket-model';
import userSessionModel from './user-session-model';

const model = {
  products: productsModel,
  basket: basketModel,
  userSession: userSessionModel,
};
```

### State type restrictions

Using plain objects as state is recommended, as it has been battle tested &
proven to be stable.

If you however want to use complex types as part of your state, you need to
consider the following:

- To support `class` instances, you need to ensure that the `class` is
  [compatible with `immer`](https://immerjs.github.io/immer/complex-objects/).
- To use `Map` or `Set` within your state,
  [you need to enable it](/docs/introduction/browser-support.html#supporting-map-or-set-within-your-state).

⚠️ Using complex types within the state may lead to unknown side effects.

## Actions

In order to perform updates against your state you need to define an
[action](/docs/api/action.html) against your model.

```javascript
import { action } from 'easy-peasy';

const model = {
  todos: [],
  addTodo: action((state, payload) => {
    state.todos.push(payload);
  }),
};
```

There are few things to digest here.

### Arguments

Firstly, note how the action receives a `state` argument. This argument will
contain the state that is local to the action, so the example above the value of
the `state` argument would be:

```json
{
  "todos": []
}
```

The second argument to actions, the `payload`, will be the value that was
provided to the action when it was dispatched. If no value was provided to the
action when it was dispatched, then the `payload` will be `undefined`.

### Modifying the state

The body of the action should perform the required updates to the state,
utilizing the `payload` if it was provided to influence the update.

You perform these updates by mutating the `state` argument directly.

This might seem peculiar to you, especially if you are familiar with Redux which
[promotes the idea of returning new immutable versions of state](https://redux.js.org/basics/reducers#handling-actions).

Don't worry, under the hood we convert the mutations into the equivalent
immutable updates against the state via the amazing
[Immer](https://immerjs.github.io/immer/) library.

We can refactor the previous example to show the equivalent immutable operation
that will be created.

```javascript
import { action } from 'easy-peasy';

const model = {
  todos: [],
  addTodo: action((state, payload) => {
    return {
      ...state,
      todos: [...state.todos, payload],
    };
  }),
};
```

In our opinion a mutation based API provides a much better developer experience
than having to manage immutability yourself.

That being said, if you prefer to return new immutable instances of your
`state`, you can do so as shown above.

### Scoping Actions

You can attach actions at any level of your plain old javascript object model.

```javascript
const model = {
  products: {
    byId: {},
  },
  basket: {
    productsInBasket: [],
    // 👇 Defining a "nested" action
    addProductToBasket: action((state, payload) => {
      state.productsInBasket.push(payload);
    }),
  },
  userSession: {
    isLoggedIn: false,
    user: null,
  },
};
```

Notice how the action is receiving the state that is local to it. i.e. the
`state` argument contains the following value.

```json
{
  "productsInBasket": []
}
```

### Bad Practices

There are few important points to make in the context of actions.

#### 1. Don't destructure the `state` argument

```javascript
action(({ todos }, payload) => {
  //       👆 destructuring the state argument is bad, m'kay
  todos.push(payload);
}),
```

Doing this will break our ability to convert your code into an immutable update
and will result in your state not being updated.

> If you are interested in why this happens; it is because Immer uses
> [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
> to track which state is being mutated/updated. Destructuring breaks out of the
> proxy, thereby removing this ability and will result in your state not being
> updated as expected.

#### 2. Don't execute any side effects within your action

Actions should remain synchronous and pure. They should only perform state
updates and must not do things like making an API request.

```javascript
action(({ todos }, payload) => {
  // 👇 side effects in actions are bad, m'kay
  fetch('/todos').then(response => response.json()).then(data => {
    state.todos = state.todos.concat(data);
  });
}),
```

If you need to perform side effects then you should encapsulate them within a
Thunk, a concept we will introduce later in the tutorial.

## Creating a Store

Once you have your model defined you can create a store.

```javascript
import { createStore } from 'easy-peasy';
import model from './model';

const store = createStore(model);
```

Easy peasy. 😎

The [createStore](/docs/api/create-store.html) function also accepts a second
argument allowing you to pass
[configuration options](/docs/api/store-config.html) to the store.

For example, if we were rehydrating a server side rendered application we could
provide the server rendered state to our store via the `initialState`
configuration option.

```javascript
const store = createStore(model, {
  initialState: serverRenderedState,
});
```

### Some fun facts about the store

#### 1. It's a Redux store

The store instance that is created is in fact just a Redux store (with a few
enhancements added). Therefore you could use it with anything that expects a
Redux store.

For example, the `react-redux` `Provider`:

```javascript
import { Provider } from 'react-redux';
import store from './my-easy-peasy-store';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
```

#### 2. It's a Redux store

It's worth stressing this point, as you can use all the
[APIs](https://redux.js.org/api/store) of a standard
[Redux store](https://redux.js.org/api/store).

```javascript
store.subscribe(() => {
  console.log('A state changed occurred');
});
```

#### 3. It's not just a Redux store

😅

Ok, so we have made a [few enhancements to the API](/docs/api/store.html),
extending the standard [Redux store API](https://redux.js.org/api/store) with
some Easy Peasy specific APIs. An example of one below.

```javascript
import store from './my-easy-peasy-store';

store.getActions().addTodo('Learn Easy Peasy');
```

In the above we are using one of the [extended APIs](/docs/api/store.html) to
get the actions defined in our model. We are then dispatching the `addTodo`
action, providing it a payload of `"Learn Easy Peasy"`.

You can read more about the extended API [here](/docs/api/store.html).

## Connecting the Store

To utilize the store within your React application you need to wrap your
application with the [StoreProvider](/docs/api/store-provider.html) component,
providing the store as prop.

```javascript
import { StoreProvider } from 'easy-peasy';
import store from './my-easy-peasy-store';

ReactDOM.render(
  <StoreProvider store={store}>
    <App />
  </StoreProvider>,
  document.getElementById('root'),
);
```

This is a very similar experience when compared to using Redux.

## Using the Store

Easy Peasy ships with a variety of hooks allowing for convenient interaction
with the store from your components.

### The `useStoreState` hook

To consume state within your components utilize the
[useStoreState](/docs/api/use-store-state.md) hook.

```javascript
import { useStoreState } from 'easy-peasy';

function Todos() {
  const todos = useStoreState((state) => state.todos);
  return <TodoList todos={todos} />;
}
```

The `useStoreState` hook accepts a selector function which should resolve the
state that your component needs.

It's completely reasonable to use the `useStoreState` multiple times within a
component to resolve all the various pieces of state you might require.

```javascript
import { useStoreState } from 'easy-peasy';

function Todos() {
  const todos = useStoreState((state) => state.todos);
  return <TodoList todos={todos} />;
}
```

#### Important note on selector optimization

The `useStoreState` will execute any time an update to your store's state
occurs. It compares the newly resolved state against the previously resolved
state via a strict equality check.

```javascript
if (prevState !== nextState) {
  console.log('We will re-render your component');
} else {
  console.log('We will do nothing');
}
```

If the newly resolved state is not equal to the previously resolved state your
component will be re-rendered, receiving the new state.

With this in mind, it is important to take care not to create a selector that
will return a value which will always break strict equality checking.

```javascript
// These are some examples of selectors that may have negative performance
// characteristics.

useStoreState((state) => {
  // We are creating a new object every time!
  return {
    name: state.name,
    age: state.age,
  };
});

useStoreState((state) => {
  // We are returning a new array every time!
  return [...state.fruits, ...state.vegetables];
});
```

In the above examples we are returning new object and array instances within our
selector functions. These value will never be strictly equal to the previously
resolved object/array values and therefore our component will re-render for any
update to our store.

Please avoid pitfalls such as above. If you need to derive different forms of
state, then we recommend either using computed properties (will be introduced
later), or to pull out the individual pieces of state within your component and
then derive the new state directly within your component's render.

### The `useStoreActions` hook

To use actions within our component we can utilize the
[useStoreActions](/docs/api/use-store-actions.md) hook.

```javascript
import { useStoreActions } from 'easy-peasy';

function AddTodoForm() {
  // We provide a selector to resolve an action, rather than state
  //                                 👇
  const addTodo = useStoreActions((actions) => actions.addTodo);
  const [value, setValue] = React.useState('');
  return (
    <>
      <input onChange={(e) => setValue(e.target.value)} value={value} />
      {/* Dispatch the action with a payload
                                       👇    */}
      <button onClick={() => addTodo(value)}>Add Todo</button>
    </>
  );
}
```

Similar to the `useStoreState` hook we pass a selector function, however, now we
are resolving an action instead of state.

We can dispatch our actions with or without a `payload` argument.

## Thunks

Thunks provide us with the capability to encapsulate side effects, whilst also
having the ability to dispatch actions in order to update our state accordingly.

### Defining thunks

We can define a thunk against our model via the [thunk](/docs/api/thunk.html)
API.

```javascript
import { action, thunk } from 'easy-peasy';
//                 👆

const model = {
  todos: [],
  addTodo: action((state, payload) => {
    state.todos.push(payload);
  }),
  //         👇
  saveTodo: thunk(async (actions, payload) => {
    const { data } = await axios.post('/todos', payload);
    actions.addTodo(data);
  }),
};
```

Looking at our thunk you will see that instead of state it receives the actions
that are local to the thunk. In this case the actions argument will have the
following structure:

```json
{
  "addTodo": Function
}
```

Within the example above our thunk is executing an API request, utilizing the
payload that the thunk received as the POST data. We subsequently utilize the
returned data, dispatching the `addTodo` action to update our store.

Notice how we are using
[async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
in this example to manage the asynchronous execution of our axios request. We
can alternatively utilize a
[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise),
however, we must take care to return the
[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
so that Easy Peasy is able to manage the asynchronous execution of our thunk
effectively. Below is our `saveTodo` thunk rewritten to illustrate this.

```javascript
saveTodo: thunk((actions, payload) => {
  // Important to return the Promise
  // 👇
  return axios.post('/todos', payload)
    .then(({ data }) => {
      actions.addTodo(data);
    });
}),
```

### Dispatching thunks

### Some interesting information about thunks

Thunks have some interesting properties and recommended practices, which we will
cover below.

#### 1. You should handle errors within your thunk

Performing side effects come with risks. Networks could be down. Payloads
invalid. etc.

We highly recommend that you develop an error handling strategy.

```javascript
import { action, thunk } from 'easy-peasy';

const model = {
  error: null,
  todos: [],
  addTodo: action((state, payload) => {
    state.todos.push(payload);
  }),
  setError: action((state, payload) => {
    state.error = payload;
  }),
  saveTodo: thunk(async (actions, payload) => {
    try {
      const { data } = await axios.post('/todos', payload);
      actions.addTodo(data);
    } catch (err) {
      actions.setError(err.message);
    }
  }),
};
```

#### 2. Thunks can also be synchronous

Whilst thunks tend to be asynchronous in nature, they need not be. It is
completely valid to have a synchronous thunk too.

```javascript
const model = {
  actionOne: action((state, payload) => {
    /* ... */
  }),
  actionTwo: action((state, payload) => {
    /* ... */
  }),
  thunkOne: thunk((actions, payload) => {
    if (condition) {
      actions.actionOne(payload);
    } else {
      actions.actionTwo(payload);
    }
  }),
};
```

#### 3. Thunks can also dispatch other thunks

As your state needs scale and become more complex you may need the ability to
coordinate/chain side effects. Thunks can be dispatched in exactly the same was
as an action. Therefore they unlock this capability.

```javascript
const model = {
  actionOne: action()
  thunkOne: thunk(async (actions, payload) => { /* ... */ }),
  thunkTwo: thunk(async (actions, payload) => {
    await actions.thunkOne(payload);
    actions.actionOne(payload);
  }),
};
```

Remember to `await` a dispatched thunk if they are asynchronous.

#### 4. Thunks can access the store state

Sometimes you might need to read the store state in order to influence the logic
within the thunk.

Thunks receive a 3rd argument which allow you to request the local state.

```javascript
const model = {
  todos: [],
  saveAllTodos: thunk((actions, payload, helpers) => {
    const { todos } = helpers.getState();
    return Promise.all(todos.map((todo) => axios.post('/todos', todo)));
  }),
};
```

#### 5. You can return data out of a thunk

Whatever is returned within a thunk will be returned to the dispatcher.

If we had the following thunk.

```javascript
const model = {
  thunkOne: thunk((actions, payload) => {
    return `hello ${payload}`;
  }),
};
```

We could illustrate the result in the following example.

```javascript
const thunkOne = useStoreActions((actions) => actions.thunkOne);

const thunkDispatchResult = thunkOne('world');

console.log(thunkDispatchResult);
// "hello world"
```

This is super useful when your thunk is asynchronous, as you can resolve the
returned `Promise`, which would provide you with the guarantee that the
execution has completed.

```javascript
const asyncLoginThunk = useStoreActions((actions) => actions.asyncLoginThunk);

asyncLoginThunk({ username: 'ww', password: 'ww1984' }).then(() => {
  console.log('Login is complete');
  // Redirect to new page?
});
```

## Computed Properties

It is a common requirement within state management to need derived state. A
basket component might need to derive the total price. A paging component may
need the total number of items. There are many cases that can appear as your
application evolves.

To avoid scattering your application with these computations Easy Peasy provides
the [computed](/docs/api/computed.html) API, a powerful utility that allows you
to quickly and succinctly define derived state computations directly against
your model.

### Defining a computed property

To create a computed property is a matter of extending your model, utilising the
[computed](/docs/api/computed.html) helper to define the derived state logic for
the property.

```javascript
import { computed } from 'easy-peasy';
//         👆

const model = {
  todos: [],
  //            👇
  todoCount: computed((state) => state.todos.length),
};
```

### Further insights into computed properties

We'd like to stress the following information in regards to computed properties.

#### 1. They are hyper optimized

Easy Peasy will do all of the required optimization under the hood to keep your
computed properties as performant as possible.

The derived state of computed properties are cached, with the cache
automatically being busted if the state that the derived state depends upon has
changed. Even if the state that the computed properties depend on has changed we
won't immediate calculate the new derived state. Computed properties have a lazy
resolution behaviour and will only be calculated if there is a component
currently using the derived data.

#### 2. You can make them accept runtime arguments

If you need to provide a runtime argument in order to derive the correct state
then you can adopt the following strategy.

```javascript
const model = {
  products: [],
  getById: computed((state) => {
    // Instead of returning derive state we will return a function that
    // accepts an argument. The function will then return the actual derived
    // state when executed
    return (id) => state.products.find((product) => product.id === id);
  }),
};
```

Whilst this can be helpful, we lose some of our performance characteristics as
Easy Peasy will only cache the returned function, not the products that the
function will resolve. To help address this you can use a memoization library of
your choice to memoize the internal function.

```javascript
import memoizerific from 'memoizerific';

const model = {
  products: [],
  getById: computed((state) => {
    // Wrap the returned function with your memoize library of choice
    //      👇
    return memoizerific(50)(
      (id) => state.products.find((product) => product.id === id),
      1000, // 👈 declare the size of the cache
    );
  }),
};
```

#### 3. Only use them to derive state, not execute side effects

Computed properties should only return derived state, and do nothing else.

```javascript
computed(state => {
  // 👇 side effects in computed properites are bad, m'kay
  return fetch('/todos').then(response => response.json());
}),
```
