> V2 has landed. Please see the [release notes](https://github.com/ctrlplusb/easy-peasy/releases/tag/v2.0.0) for full details on how to upgrade from V1.

<p>&nbsp;</p>
<p align='center'>
  <img src="https://i.imgur.com/KHTgPvA.png" width="320" />
</p>
<p align='center'>Easy peasy global state for React</p>
<p>&nbsp;</p>

[![npm](https://img.shields.io/npm/v/easy-peasy.svg?style=flat-square)](http://npm.im/easy-peasy)
[![MIT License](https://img.shields.io/npm/l/easy-peasy.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/ctrlplusb/easy-peasy.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/easy-peasy)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/easy-peasy.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/easy-peasy)

```javascript
import { action, createStore, StoreProvider, useStore, useActions } from 'easy-peasy';

// 👇 create your store, providing the model
const store = createStore({
  todos: {
    items: ['Install easy-peasy', 'Build app', 'Profit'],
    // 👇 define actions directly on your model
    add: action((state, payload) => {
      // simply mutate state to update, and we convert to immutable updates
      state.items.push(payload)
      // (you can also return a new immutable version of state if you prefer)
    })
  }
});

const App = () => (
  // 👇 wrap your app to expose the store
  <StoreProvider store={store}>
    <TodoList />
  </StoreProvider>
)

function TodoList() {
  // 👇  use hooks to get state or actions
  const todos = useStore(state => state.todos.items)
  const add = useActions(actions => actions.todos.add)
  return (
    <div>
      {todos.map((todo, idx) => <div key={idx}>{todo}</div>)}
      <AddTodo onAdd={add} />
    </div>
  )
}
```

## Features

  - Quick, easy, fun
  - Supports Typescript
  - Update state via mutations that auto convert to immutable updates
  - Derived state
  - Thunks for data fetching/persisting
  - Auto memoisation for performance
  - Includes hooks for React integration
  - Testing utils baked in
  - Supports React Native
  - Tiny, 3.2 KB gzipped
  - Powered by Redux with full interop
    - All the best of Redux, without the boilerplate
    - Redux Dev Tools support
    - Custom middleware
    - Customise root reducer enhancer
    - Easy migration path for traditional styled Redux apps

<p>&nbsp;</p>
<p align='center'>
  <img src='https://i.imgur.com/2vFSy1y.png' width='500' />
</p>
<p>&nbsp;</p>

## TOCs

  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Examples](#examples)
    - [Easy Peasy Typescript](#easy-peasy-typescript)
    - [React Todo List](#react-todo-list)
  - [Core Concepts](#core-concepts)
    - [Creating the store](#creating-the-store)
    - [Accessing state directly via the store](#accessing-state-directly-via-the-store)
    - [Modifying state via actions](#modifying-state-via-actions)
    - [Dispatching actions directly via the store](#dispatching-actions-directly-via-the-store)
    - [Creating a `thunk` action](#creating-a-thunk-action)
    - [Dispatching a `thunk` action directly via the store](#dispatching-a-thunk-action-directly-via-the-store)
    - [Deriving state via `select`](#deriving-state-via-select)
    - [Accessing Derived State directly via the store](#accessing-derived-state)
    - [Final notes](#final-notes)
  - [Usage with React](#usage-with-react)
    - [Wrap your app with StoreProvider](#wrap-your-app-with-storeprovider)
    - [Consuming state in your Components](#consuming-state-in-your-components)
    - [Firing actions in your Components](#firing-actions-in-your-components)
    - [Alternative usage via react-redux](#alternative-usage-via-react-redux)
  - [Usage with Typescript](#usage-with-typescript)
  - [Usage with React Native](#usage-with-react-native)
  - [Writing Tests](#writing-tests)
  - [API](#api)
    - [createStore(model, config)](#createstoremodel-config)
    - [action](#action)
    - [thunk(action)](#thunkaction)
    - [reducer(fn)](#reducerfn)
    - [select(selector)](#selectselector)
    - [listen(on)](#listenon)
    - [StoreProvider](#storeprovider)
    - [useStore(mapState, externals)](#usestoremapstate-externals)
    - [useActions(mapActions)](#useactionsmapactions)
    - [useDispatch()](#usedispatch)
    - [createTypedHooks()](#createTypedHooks)
  - [Typescript API](#typescript-api)
  - [Tips and Tricks](#tips-and-tricks)
    - [Generalising effects/actions/state via helpers](#generalising-effectsactionsstate-via-helpers)
  - [Prior Art](#prior-art)

<p>&nbsp;</p>

---

## Introduction

Easy Peasy gives you the power of Redux (and its tooling) whilst avoiding the boilerplate. It allows you to create a full Redux store by defining a model that describes your state and its actions. Batteries are included - you don't need to configure any additional packages to support derived state, side effects, memoisation, or integration with React.

<p>&nbsp;</p>

---

## Installation

Firstly, install React and React DOM.

```bash
npm install react
npm install react-dom
```

> Note: please ensure you install versions >= 16.8.0 for both `react` and `react-dom`, as this library depends on the new hooks feature

Then install Easy Peasy.

```bash
npm install easy-peasy
```

You're off to the races.

<p>&nbsp;</p>

---

## Examples

### Easy Peasy Typescript

This GitHub repository shows off how to utilise Typescript with Easy Peasy. I highly recommend cloning it and running it so that you can experience first hand what a joy it is to have types helping you with global state.

https://github.com/ctrlplusb/easy-peasy-typescript

### React Todo List

A simple implementation of a todo list that utilises a mock service to illustrate data fetching/persisting via effect actions. A fully stateful app with no class components. Hot dang hooks are awesome.

https://codesandbox.io/s/woyn8xqk15

<p>&nbsp;</p>

---

## Core Concepts

The below will introduce you to the core concepts of Easy Peasy, where we will interact with the Redux store directly. In a following section we shall illustrate how to integrate [Easy Peasy within a React application](#usage-with-react).

### Creating the store

Firstly you need to define your model. This represents the structure of your Redux state along with its default values. Your model can be as deep and complex as you like. Feel free to split your model across many files, importing and composing them as you like.

```javascript
const model = {
  todos: {
    items: [],
  }
};
```

Then you provide your model to `createStore`.

```javascript
import { createStore } from 'easy-peasy';

const store = createStore(model);
```

You will now have a [Redux store](https://redux.js.org/api/store) - all the standard APIs of a Redux store is available to you. 👍

### Accessing state directly via the store

You can access your store's state using the `getState` API of the Redux store.

```javascript
store.getState().todos.items;
```

### Modifying state via actions

In order to mutate your state you need to define an action against your model.

```javascript
import { action } from 'easy-peasy'; // 👈 import the helper

const store = createStore({
  todos: {
    items: [],
    //         👇 define the action with the helper
    addTodo: action((state, payload) => {
      // Mutate the state directly. Under the hood we convert this to an
      // an immutable update in the store, but at least you don't need to
      // worry about being careful to return new instances etc. This also
      // makes it easy to update deeply nested items.
      state.items.push(payload)
    })
  }
});
```

The action will receive as its first parameter the slice of the state that it was added to. So in the example above our action would receive `{ items: [] }` as the value for `state`. It will also receive any `payload` that may have been provided when the action was triggered.

> Note: Some prefer not to use a mutation based API. You can return new "immutable" instances of your state if you prefer:
>
> ```javascript
> addTodo: action((state, payload) => {
>   return { ...state, items: [...state.items, payload] };
> })
> ```

### Dispatching actions directly via the store

Easy Peasy will bind your actions against the store's `dispatch` using paths that match the location of the action on your model. This allows you to easily dispatch your actions, providing any payload that they may require.

```javascript
store.dispatch.todos.addTodo('Install easy-peasy');
//            |-------------|
//                  |-- path matches our model (todos.addTodo)
```

Check your state and you should see that it is updated.

```javascript
store.getState().todos.items;
// ['Install easy-peasy']
```

### Creating a `thunk` action

If you wish to perform side effects, such as fetching or persisting data from your server then you can use the `thunk` helper to declare a thunk action.

```javascript
import { thunk } from 'easy-peasy'; // 👈 import the helper

const store = createStore({
  todos: {
    items: [],

    //          👇 define a thunk action via the helper
    saveTodo: thunk(async (actions, payload) => {
      //                      👆
      // Notice that the thunk will receive the actions allowing you to dispatch
      // other actions after you have performed your side effect.
      const saved = await todoService.save(payload);
      // Now we dispatch an action to add the saved item to our state
      //         👇
      actions.todoSaved(saved);
    }),

    todoSaved: action((state, payload) => {
      state.items.push(payload)
    })
  }
});
```

As you can see in the example above you can't modify the state directly within an `thunk` action, however, the `thunk` action is provided `actions`, which contains all the actions scoped to where the `thunk` exists on your model. This allows you to delegate to state updates to "normal" actions where required.

> Note: If you want to dispatch actions that live within other branches of your model you can use the `dispatch` which is provided inside the `helper` argument. See the `thunk` API docs for more information.

### Dispatching a `thunk` action directly via the store

You can dispatch a thunk action in the same manner as a normal action. However, a `thunk` action always returns a `Promise` allowing you to chain in order to execute after the `thunk` has completed.

```javascript
store.dispatch.todos.saveTodo('Install easy-peasy').then(() => {
  console.log('Todo saved');
})
```

### Deriving state via `select`

If you have state that can be derived from state then you can use the [`select`](#selectselector) helper. Simply attach it to any part of your model.

```javascript
import { select } from 'easy-peasy'; // 👈 import then helper

const store = createStore({
  shoppingBasket: {
    products: [{ name: 'Shoes', price: 123 }, { name: 'Hat', price: 75 }],
    totalPrice: select(state =>
      state.products.reduce((acc, cur) => acc + cur.price, 0)
    )
  }
}
```

The derived data will be cached and will only be recalculated when the associated state changes.

This can be really helpful to avoid unnecessary re-renders in your react components, especially when you do things like converting an object map to an array in your `connect`. Typically people would use [`reselect`](https://github.com/reduxjs/reselect) to alleviate this issue, however, with Easy Peasy it's this feature is baked right in.

You can attach selectors to any part of your state. Similar to actions they will receive the local state that they are attached to and can access all the state down that branch of state.

### Accessing Derived State directly via the store

You can access derived state as though it were a standard piece of state.

```javascript
store.getState().shoppingBasket.totalPrice
```

> Note! See how we don't call the derived state as a function. You access it as a simple property.

### Final notes

Now that you have gained an understanding of the store we suggest you read the section on [Usage with React](#usage-with-react) to learn how to use Easy Peasy in your React apps.

Oh! And don't forget to install the [Redux Dev Tools Extension](https://github.com/zalmoxisus/redux-devtools-extension) to visualise your actions firing along with the associated state updates. 👍

<p>&nbsp;</p>

---

## Usage with React

With the new [Hooks](https://reactjs.org/docs/hooks-intro.html) feature introduced in React v16.8.0 it's never been easier to provide a mechanism to interact with global state in your components. We have provided a few hooks, allowing you to access the state and actions from your store.

If you aren't familiar with hooks yet we highly recommend that you read the [official documentation](https://reactjs.org/docs/hooks-intro.html) and try playing with our [examples](#examples).

### Wrap your app with StoreProvider

Firstly we will need to create your store and wrap your application with the `StoreProvider`.

```javascript
import { StoreProvider, createStore } from 'easy-peasy';
import model from './model'

const store = createStore(model);

const App = () => (
  <StoreProvider store={store}>
    <TodoList />
  </StoreProvider>
)
```

### Consuming state in your Components

To access state within your components you can use the `useStore` hook.

```javascript
import { useStore } from 'easy-peasy';

const TodoList = () => {
  const todos = useStore(state => state.todos.items);
  return (
    <div>
      {todos.map((todo, idx) => <div key={idx}>{todo.text}</div>)}
    </div>
  );
};
```

In the case that your `useStore` implementation depends on an "external" value when mapping state. Then you should provide the respective "external" within the second argument to the `useStore`. The `useStore` hook will then track the external value and ensure to recalculate the mapped state if any of the external values change.

```javascript
import { useStore } from 'easy-peasy';

const Product = ({ id }) => {
  const product = useStore(
    state => state.products[id], // 👈 we are using an external value: "id"
    [id] // 👈 we provide "id" so our useStore knows to re-execute mapState
         //    if the "id" value changes
  );
  return (
    <div>
      <h1>{product.title}</h1>
      <p>{product.description}</p>
    </div>
  );
};
```

We recommend that you read the API docs for the [`useStore` hook](#usestoremapstate) to gain a full understanding of the behaviours and pitfalls of the hook.

### Firing actions in your Components

In order to fire actions in your components you can use the `useActions` hook.

```javascript
import { useState } from 'react';
import { useActions } from 'easy-peasy';

const AddTodo = () => {
  const [text, setText] = useState('');
  const addTodo = useActions(actions => actions.todos.add);
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => addTodo(text)}>Add</button>
    </div>
  );
};
```

For more on how you can use this hook please ready the API docs for the [`useActions` hook](#useactionsmapactions).

### Alternative usage via react-redux

As Easy Peasy outputs a standard Redux store it is entirely possible to use Easy Peasy with the official [`react-redux`](https://github.com/reduxjs/react-redux) package.

<details>
<summary>First, install the `react-redux` package</summary>
<p>

```bash
npm install react-redux
```

</p>
</details>

<details>
<summary>Then wrap your app with the `Provider`</summary>
<p>

```javascript
import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'easy-peasy';
import { Provider } from 'react-redux'; // 👈 import the provider
import model from './model';
import TodoList from './components/TodoList';

// 👇 then create your store
const store = createStore(model);

const App = () => (
  // 👇 then pass it to the Provider
  <Provider store={store}>
    <TodoList />
  </Provider>
)

render(<App />, document.querySelector('#app'));
```

</p>
</details>

<details>
<summary>Finally, use `connect` against your components</summary>
<p>

```javascript
import React, { Component } from 'react';
import { connect } from 'react-redux'; // 👈 import the connect

function TodoList({ todos, addTodo }) {
  return (
    <div>
      {todos.map(({id, text }) => <Todo key={id} text={text} />)}
      <AddTodo onSubmit={addTodo} />
    </div>
  )
}

export default connect(
  // 👇 Map to your required state
  state => ({ todos: state.todos.items }
  // 👇 Map your required actions
  dispatch => ({ addTodo: dispatch.todos.addTodo })
)(EditTodo)
```

</p>
</details>

<p>&nbsp;</p>

This is by no means an exhaustive overview of Easy Peasy. We _highly_ recommend you give the [API](#API) documentation a quick glance so that you gain an understanding of some of the tools and helpers that Easy Peasy exposes to you.

---

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
import { useStore, useActions, Actions, State } from 'easy-peasy';
import { StoreModel } from './your-store';

function MyComponent() {
  const token = useStore((state: State<StoreModel>) =>
    state.user.token
  )
  const login = useActions((actions: Actions<StoreModel>) =>
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
import { useStore, useActions } from './hooks';

function MyComponent() {
  const token = useStore((state) => state.user.token)
  const login = useActions((actions) => actions.user.login)
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

## Usage with React Native

Easy Peasy is platform agnostic but makes use of features that may not be available in all environments.

<details>
<summary>How to enable remote Redux dev tools</summary>
<p>
React Native, hybrid, desktop and server side Redux apps can use Redux Dev Tools using the [Remote Redux DevTools](https://github.com/zalmoxisus/remote-redux-devtools) library.

To use this library, you will need to pass the DevTools compose helper as part of the [config object](#createstoremodel-config) to `createStore`

```javascript
import { createStore } from 'easy-peasy';
import { composeWithDevTools } from 'remote-redux-devtools';
import model from './model';

/**
 * model, is used for passing through the base model
 * the second argument takes an object for additional configuration
 */

const store = createStore(model, {
  compose: composeWithDevTools({ realtime: true, trace: true })
  // initialState: {}
});

export default store;
```

See [https://github.com/zalmoxisus/remote-redux-devtools#parameters](https://github.com/zalmoxisus/remote-redux-devtools#parameters) for all configuration options.
</p>
</details>

<p>&nbsp;</p>

---

## Writing Tests

The below covers some strategies for testing your store / components. If you have any useful test strategies please consider making a pull request so that we can expand this section.

All the below examples are using [Jest](https://jestjs.io) as the test framework, but the ideas should hopefully translate easily onto your test framework of choice.

In the examples below you will see that we are testing specific parts of our model in isolation. This makes it far easier to do things like bootstrapping initial state for testing purposes, whilst making your tests less brittle to changes in your full store model structure.

<details>
<summary>Testing an action</summary>
<p>

Actions are relatively simple to test as they are essentially an immutable update to the store. We can therefore test the difference.

Given the following model under test:

```typescript
import { action } from 'easy-peasy'

const todosModel = {
  items: {},
  add: action((state, payload) => {
    state.items[payload.id] = payload
  }),
}
```

We could test it like so:

```typescript
test('add action', async () => {
  // arrange
  const todo = { id: 1, text: 'foo' }
  const store = createStore(todosModel)

  // act
  store.dispatch.add(todo)

  // assert
  expect(store.getState().items).toEqual({ [todo.id]: todo })
})
```

</p>
</details>

<details>
<summary>Testing a thunk</summary>
<p>

Thunks are more complicated to test than actions as they can invoke network requests and other actions.

There will likely be seperate tests for our actions, therefore it is recommended that you don't test for the state changes of actions fired by your thunk. We rather recommend that you test for what actions were fired from your thunk under test.

To do this we expose an additional configuration value on the `createStore` API, specifically `mockActions`. If you set the `mockActions` configuration value, then all actions that are dispatched will not affect state, and will instead be mocked and recorded. You can get access to the recorded actions via the `getMockedActions` function that is available on the store instance. We took inspiration for this functionality from the awesome [`redux-mock-store`](https://github.com/dmitry-zaets/redux-mock-store) package.

In addition to this approach, if you perform side effects such as network requests within your thunks, we highly recommend that you expose the modules you use to do so via the `injections` configuration variable of your store. If you do this then it makes it significantly easier to provide mocked instances to your thunks when testing.

We will demonstrate all of the above within the below example.

Given the following model under test:

```typescript
import { action, thunk } from 'thunk';

const todosModel = {
  items: {},
  add: action((state, payload) => {
    state.items[payload.id] = payload
  }),
  fetchById: thunk(async (actions, payload, helpers) => {
    const { injections } = helpers
    const todo = await injections.fetch(`/todos/${payload}`).then(r => r.json())
    actions.add(todo)
  }),
}
```

We could test it like so:

```typescript
import { createStore, actionName, thunkStartName, thunkCompleteName } from 'easy-peasy'

const createFetchMock = response =>
  jest.fn(() => Promise.resolve({ json: () => Promise.resolve(response) }))

test('fetchById', async () => {
  // arrange
  const todo = { id: 1, text: 'Test my store' }
  const fetch = createFetchMock(todo)
  const store = createStore(todosModel, {
    injections: { fetch },
    mockActions: true,
  })

  // act
  await store.dispatch.fetchById(todo.id)

  // assert
  expect(fetch).toHaveBeenCalledWith(`/todos/${todo.id}`)
  expect(store.getMockedActions()).toEqual([
    { type: thunkStartName(todosModel.fetchById), payload: todo.id },
    { type: actionName(todosModel.add), payload: todo },
    { type: thunkCompleteName(todosModel.fetchById), payload: todo.id },
  ])
})
```

</p>
</details>

<details>
<summary>Testing components</summary>
<p>

When testing your components I strongly recommend the approach recommended by Kent C. Dodd's awesome [Testing Javascript](https://testingjavascript.com/) course, where you try to test the behaviour of your components using a natural DOM API, rather than reaching into the internals of your components. He has published a very useful package by the name of [`react-testing-library`](https://github.com/kentcdodds/react-testing-library) to help us do so. The tests below shall be adopting this package and strategy.

Imagine we were trying to test the following component.

```typescript
function Counter() {
  const count = useStore(state => state.count)
  const increment = useActions(actions => actions.increment)
  return (
    <div>
      Count: <span data-testid="count">{count}</span>
      <button type="button" onClick={increment}>
        +
      </button>
    </div>
  )
}
```

As you can see it is making use of our hooks to gain access to state and actions of our store.

We could adopt the following strategy to test it.

```typescript
import { createStore, StoreProvider } from 'easy-peasy'
import model from './model';

test('Counter', () => {
  // arrange
  const store = createStore(model)
  const app = (
    <StoreProvider store={store}>
      <ComponentUnderTest />
    </StoreProvider>
  )

  // act
  const { getByTestId, getByText } = render(app)

  // assert
  expect(getByTestId('count').textContent).toEqual('0')

  // act
  fireEvent.click(getByText('+'))

  // assert
  expect(getByTestId('count').textContent).toEqual('1')
})
```

As you can see we create a store instance in the context of our test and wrap the component under test with the `StoreProvider`. This allows our component to act against our store.

We then interact with our component using the DOM API exposed by the render.

This grants us great power in being able to test our components with a great degree of confidence that they will behave as expected.

Some other strategies that you could employ whilst using this pattern include:

  - Providing an initial state to your store within the test.

    ```typescript
    test('Counter', () => {
      // arrange
      const store = createStore(model, { initialState: initialStateForTest })

      // ...
    })
    ```

  - Utilising the `injections` and `mockActions` configurations of the `createStore` to avoid performing actions with side effects in your test.

There is no one way to test your components, but it is good to know of the tools available to you. However you choose to test your components, I do recommend that you try to test them as close to their real behaviour as possible - i.e. try your best to prevent implementation details leaking into your tests.

</p>
</details>

<p>&nbsp;</p>

---

## API

Below is an overview of the API exposed by Easy Peasy.

### createStore(model, config)

Creates a Redux store based on the given model. The model must be an object and can be any depth. It also accepts an optional configuration parameter for customisations.

<details>
<summary>Arguments</summary>
<p>

  - `model` (Object, required)

    Your model representing your state tree, and optionally containing action functions.

  - `config` (Object, not required)

    Provides custom configuration options for your store. It supports the following options:

    - `compose` (Function, not required, default=undefined)

       Custom [`compose`](https://redux.js.org/api/compose) function that will be used in place of the one from Redux or Redux Dev Tools. This is especially useful in the context of React Native and other environments. See the Usage with React Native notes.

    - `devTools` (bool, not required, default=true)

       Setting this to `true` will enable the [Redux Dev Tools Extension](https://github.com/zalmoxisus/redux-devtools-extension).

    - `disableInternalSelectFnMemoize` (bool, not required, default=false)

      Setting this to `true` will disable the automatic memoisation of a fn that you may return in any of your [`select`](#selectselector) implementations. Please see the [`select`](#selectselector) documentation for more information.

    - `enhancers` (Array, not required, default=[])

      Any custom [store enhancers](https://redux.js.org/glossary#store-enhancer) you would like to apply to your Redux store.

    - `initialState` (Object, not required, default=undefined)

      Allows you to hydrate your store with initial state (for example state received from your server in a server rendering context).

    - `injections` (Any, not required, default=undefined)

      Any dependencies you would like to inject, making them available to your effect actions. They will become available as the 4th parameter to the effect handler. See the [effect](#effectaction) docs for more.

    - `middleware` (Array, not required, default=[])

      Any additional [middleware](https://redux.js.org/glossary#middleware) you would like to attach to your Redux store.

    - `mockActions` (boolean, not required, default=false)

      Useful when testing your store, especially in the context of thunks. When set to `true` none of the actions dispatched will update the state, they will be instead recorded and can be accessed via the `getMockedActions` API that is added to the store.  Please see the ["Writing Tests"](#writing-tests) section for more information.

    - `reducerEnhancer` (Function, not required, default=(reducer => reducer))

      Any additional reducerEnhancer you would like to enhance to your root reducer (for example you want to use [redux-persist](https://github.com/rt2zz/redux-persist)).

</p>
</details>

<details>
<summary>Store Instance API</summary>
<p>

When you have created a store all the standard APIs of a [Redux Store](https://redux.js.org/api/store) are available. Please reference [their docs](https://redux.js.org/api/store) for more information. In addition to the standard APIs, Easy Peasy enhances the instance to contain the following:

  - `dispatch` (Function & Object, required)

    The Redux store `dispatch` behaves as normal, however, it also has the actions from your model directly mounted against it - allowing you to easily dispatch actions. Please see the docs on actions/thunks for examples.

  - `getMockedActions` (Function, required)

    When the `mockActions` configuration value was passed to the `createStore` then calling this function will return the actions that have been dispatched (and mocked). This is useful in the context of testing - especially thunks.

  - `clearMockedActions` (Function, required)

    When the `mockActions` configuration value was passed to the `createStore` then calling this function clears the list of mocked actions that have been tracked by the store. This is useful in the context of testing - especially thunks.

</p>
</details>

<details>
<summary>Example</summary>
<p>

```javascript
import { createStore } from 'easy-peasy';

const store = createStore({
  todos: {
    items: [],
    addTodo: (state, text) => {
      state.items.push(text)
    }
  },
  session: {
    user: undefined,
  }
})
```

</p>
</details>

### action

Declares an action on your model. An action allows you to perform updates on your store.

The action will have access to the part of the state tree where it was defined.

<details>
<summary>Arguments</summary>
<p>

  - action (Function, required)

    The action definition. It receives the following arguments:

    - `state` (Object, required)

      The part of the state tree that the action is against. You can mutate this state value directly as required by the action. Under the hood we convert these mutations into an update against the Redux store.

    - `payload` (Any)

      The payload, if any, that was provided to the action.

When your model is processed by Easy Peasy to create your store all of your actions will be made available against the store's `dispatch`. They are mapped to the same path as they were defined in your model. You can then simply call the action functions providing any required payload.  See the example below.
</p>
</details>

<details>
<summary>Example</summary>
<p>

```javascript
import { action, createStore } from 'easy-peasy';

const store = createStore({
  todos: {
    items: [],
    add: action((state, payload) => {
      state.items.push(payload)
    })
  }
});

store.dispatch.todos.add('Install easy-peasy');
```
</p>
</details>

### thunk(action)

Declares a thunk action on your model. Allows you to perform effects such as data fetching and persisting.

<details>
<summary>Arguments</summary>
<p>

  - action (Function, required)

    The thunk action definition. A thunk typically encapsulates side effects (e.g. calls to an API). It can be asynchronous - i.e. use Promises or async/await. Thunk actions cannot modify state directly, however, they can dispatch other actions to do so.

    It receives the following arguments:

    - `actions` (required)

      The actions that are bound to same section of your model as the thunk. This allows you to dispatch another action to update state for example.

    - `payload` (Any, not required)

      The payload, if any, that was provided to the action.

    - `helpers` (Object, required)

      Contains a set of helpers which may be useful in advanced cases. The object contains the following properties:

      - `dispatch` (required)

        The Redux store `dispatch` instance. This will have all the Easy Peasy actions bound to it allowing you to dispatch additional actions.

      - `getState` (Function, required)

        When executed it will provide the local state of where the thunk is attached to your model. This can be useful in the cases where you require state in the execution of your thunk.

      - `getStoreState` (Function, required)

        When executed it will provide the root state of your model. This can be useful in the cases where you require state in the execution of your thunk.

      - `injections` (Any, not required, default=undefined)

        Any dependencies that were provided to the `createStore` configuration will be exposed as this argument. See the [`createStore`](#createstoremodel-config) docs on how to specify them.

      - `meta` (Object, required)

        This object contains meta information related to the effect. Specifically it contains the following properties:

          - parent (Array, string, required)

            An array representing the path of the parent to the action.

          - path (Array, string, required)

            An array representing the path to the action.

        This can be represented via the following example:

        ```javascript
        const store = createStore({
          products: {
            fetchById: thunk((dispatch, payload, { meta }) => {
              console.log(meta);
              // {
              //   parent: ['products'],
              //   path: ['products', 'fetchById']
              // }
            })
          }
        });
        ```

When your model is processed by Easy Peasy to create your store all of your thunk actions will be made available against the store's `dispatch`. They are mapped to the same path as they were defined in your model. You can then simply call the action functions providing any required payload.  See the examples below.

</p>
</details>

<details>
<summary>Example</summary>
<p>

```javascript
import { action, createStore, thunk } from 'easy-peasy'; // 👈 import then helper

const store = createStore({
  session: {
    user: undefined,
    // 👇 define your thunk action
    login: thunk(async (actions, payload) => {
      const user = await loginService(payload)
      actions.loginSucceeded(user)
    }),
    loginSucceeded: action((state, payload) => {
      state.user = payload
    })
  }
});

// 👇 you can dispatch and await on the thunk action
store.dispatch.session.login({
  username: 'foo',
  password: 'bar'
})
// 👇 thunk actions _always_ return a Promise
.then(() => console.log('Logged in'));

```

</p>
</details>

<details>
<summary>Example accessing local state via the getState parameter</summary>
<p>

```javascript
import { createStore, thunk } from 'easy-peasy';

const store = createStore({
  counter: {
    count: 1,
    // getState allows you to gain access to the local state
    //                                               👇
    doSomething: thunk(async (dispatch, payload, { getState }) => {
      // Calling it exposes the local state. i.e. the part of state where the
      // thunk was attached
      //            👇
      console.log(getState())
      // { count: 1 }
    }),
  }
});

store.dispatch.doSomething()
```

</p>
</details>

<details>
<summary>Example accessing full state via the getStoreState parameter</summary>
<p>

```javascript
import { createStore, thunk } from 'easy-peasy';

const store = createStore({
  counter: {
    count: 1,
    // getStoreState allows you to gain access to the  store's state
    //                                               👇
    doSomething: thunk(async (dispatch, payload, { getStoreState }) => {
      // Calling it exposes the root state of your store. i.e. the full
      // store state 👇
      console.log(getState())
      // { counter: { count: 1 } }
    }),
  }
});

store.dispatch.doSomething()
```

</p>
</details>

<details>
<summary>Example dispatching an action from another part of the model</summary>
<p>

```javascript
import { action, createStore, thunk } from 'easy-peasy';

const store = createStore({
  audit: {
    logs: [],
    add: action((state, payload) => {
      audit.logs.push(payload);
    })
  },
  todos: {
    // dispatch allows you to gain access to the store's dispatch
    //                                      👇
    saveTodo: thunk((actions, payload, { dispatch }) => {
      // ...
      dispatch.audit.add('Added a todo');
    })
  }
});

store.dispatch.todos.saveTodo('foo');
```

We don't recommned doing this, and instead encourage you to use the [`listen`](#listenon) helper to invert responsibilites. However, there may exceptional cases in which you need to do the above.

</p>
</details>

<details>
<summary>Example with Dependency Injection</summary>
<p>

```javascript
import { createStore, thunk } from 'easy-peasy';
import api from './api' // 👈 a dependency we want to inject

const store = createStore(
  {
    foo: 'bar',
    //                       injections are exposed here 👇
    doSomething: thunk(async (dispatch, payload, { injections }) => {
      const { api } = injections
      await api.foo()
    }),
  },
  {
    // 👇 specify the injections parameter when creating your store
    injections: {
      api,
    }
  }
);

store.dispatch.doSomething()
```

</p>
</details>

### reducer(fn)

Declares a section of state to be calculated via a "standard" reducer function - as typical in Redux. This was specifically added to allow for integrations with existing libraries, or legacy Redux code.

Some 3rd party libraries, for example [`connected-react-router`](https://github.com/supasate/connected-react-router), require you to attach a reducer that they provide to your state. This helper will you achieve this.

<details>
<summary>Arguments</summary>
<p>

  - fn (Function, required)

    The reducer function. It receives the following arguments.

    - `state` (Object, required)

      The current value of the property that the reducer was attached to.

    - `action` (Object, required)

      The action object, typically with the following shape.

      - `type` (string, required)

        The name of the action.

      - `payload` (any)

        Any payload that was provided to the action.

</p>
</details>

<details>
<summary>Example</summary>
<p>

```javascript
import { createStore, reducer } from 'easy-peasy';

const store = createStore({
  counter: reducer((state = 1, action) => {
    switch (action.type) {
      case 'INCREMENT': state + 1;
      default: return state;
    }
  })
});

store.dispatch({ type: 'INCREMENT' });

store.getState().counter;
// 2
```

</p>
</details>

### select(selector)

Attach derived state (i.e. is calculated from other parts of your state) to your store.

The results of your selectors will be cached, and will only be recomputed if the state that they depend on changes. You may be familiar with `reselect` - this feature provides you with the same benefits.

<details>
<summary>Arguments</summary>
<p>

  - selector (Function, required)

    The selector function responsible for resolving the derived state. It will be provided the following arguments:

    - `state` (Object, required)

      The local part of state that the `select` property was attached to.

    You can return any derived state you like.

    It also supports returning a function. This allows you to support creating a "dynamic" selector that accepts arguments (e.g. `productById(1)`). We will automatically optimise the function that you return - ensuring that any calls to the function will be automatically be memoised - i.e. calls to it with the same arguments will return cached results. This automatic memoisation of the function can be disabled via the `disableInternalSelectFnMemoize` setting on the `createStore`'s config argument.

  - dependencies (Array, not required)

    If this selector depends on data from other selectors then you should provide the respective selectors within an array to indicate the case. This allows us to make guarantees of execution order so that your state is derived in the manner you expect it to.

</p>
</details>

<details>
<summary>Example</summary>
<p>

```javascript
import { select } from 'easy-peasy'; // 👈 import then helper

const store = createStore({
  shoppingBasket: {
    products: [{ name: 'Shoes', price: 123 }, { name: 'Hat', price: 75 }],
    // 👇 define your derived state
    totalPrice: select(state =>
      state.products.reduce((acc, cur) => acc + cur.price, 0)
    )
  }
};

// 👇 access the derived state as you would normal state
store.getState().shoppingBasket.totalPrice;
```

</p>
</details>

<details>
<summary>Example with arguments</summary>
<p>

```javascript
import { select } from 'easy-peasy'; // 👈 import then helper

const store = createStore({
  products: [{ id: 1, name: 'Shoes', price: 123 }, { id: 2, name: 'Hat', price: 75 }],

  productById: select(state =>
    // 👇 return a function that accepts the arguments
    id => state.products.find(x => x.id === id)
  )
};

// 👇 access the select fn and provide its required arguments
store.getState().productById(1);

// This next call will return a cached result
store.getState().productById(1);
```

</p>
</details>

<details>
<summary>Example with Dependencies</summary>
<p>

```javascript
import { select } from 'easy-peasy';

const totalPriceSelector = select(state =>
  state.products.reduce((acc, cur) => acc + cur.price, 0),
)

const netPriceSelector = select(
  state => state.totalPrice * ((100 - state.discount) / 100),
  [totalPriceSelector] // 👈 declare that this selector depends on totalPrice
)

const store = createStore({
  discount: 25,
  products: [{ name: 'Shoes', price: 160 }, { name: 'Hat', price: 40 }],
  totalPrice: totalPriceSelector,
  netPrice: netPriceSelector // price after discount applied
});
```

</p>
</details>

### listen(on)

Allows you to attach listeners to any action or thunk.

This enables parts of your model to respond to actions being fired in other parts of your model. For example you could have a "notifications" model that populates based on certain actions being fired (logged in, product added to basket, etc).

It also supports attach listeners to a "string" named action. This allows with interop with 3rd party libraries, or aids in migration.

Note: If any action being listened to does not complete successfully (i.e. throws an exception), then no listeners will be fired.

<details>
<summary>Arguments</summary>
<p>

  - `on` (Function, required)

    Allows you to attach a listener to an action. It expects the following arguments:

    - `target` (action | thunk | string, required)

      The target action you wish to listen to - you provide the direct reference to the action, or the string name of it.

    - `handler` (Function, required)

      The handler thunk to be executed after the target action is fired successfully. It can be an [`action`](#action) or a [`thunk`](#thunkaction).

      The payload for the handler will be the same payload that the target action received

</p>
</details>


<details>
<summary>Example</summary>
<p>

```javascript
import { action, listen } from 'easy-peasy'; // 👈 import the helper

const userModel = {
  user: null,
  loggedIn: action((state, user) => {
    state.user = user;
  }),
  logOut: action((state) => {
    state.user = null;
  })
};

const notificationModel = {
  msg: '',

  // 👇 you can label your listeners as you like, e.g. "userListeners"
  listeners: listen((on) => {
    // Thunk handler
    on(userModel.loggedIn, thunk(async (actions, payload, helpers) => {
      const msg = `${payload.username} logged in`
      await auditService.log(msg)
    }))

    // Action handler
    on(userModel.logOut, action((state) => {
      state.msg = 'User logged out'
    });
  })
};

const model = {
  user: userModel,
  notification: notificationModel
};
```

</p>
</details>

<details>
<summary>Example listening to string named action</summary>
<p>

```javascript
import { listen } from 'easy-peasy';

const model = {
  msg: '',
  set: (state, payload) => { state.msg = payload; },

  listeners: listen((on) => {
    //      👇 passing in action name
    on('ROUTE_CHANGED', (actions, payload) => {
      //                            👆
      // We won't know the type of payload, so it will be "any".
      // You will have to annotate it manually if you are using
      // Typescript and care about the payload type.
      actions.set(`Route was changed`);
    });
  })
};
```
</p>
</details>


### StoreProvider

Initialises your React application with the store so that your components will be able to consume and interact with the state via the `useStore` and `useActions` hooks.

<details>
<summary>Example</summary>
<p>

```javascript
import { StoreProvider, createStore } from 'easy-peasy';
import model from './model'

const store = createStore(model);

const App = () => (
  <StoreProvider store={store}>
    <TodoList />
  </StoreProvider>
)
```

</p>
</details>

### useStore(mapState, externals)

A [hook](https://reactjs.org/docs/hooks-intro.html) granting your components access to the store's state.

<details>
<summary>Argument</summary>
<p>

  - `mapState` (Function, required)

    The function that is used to resolved the piece of state that your component requires. The function will receive the following arguments:

    - `state` (Object, required)

      The root state of your store.

  - `externals` (Array of any, not required)

    If your `useStore` function depends on an external value (for example a property of your component), then you should provide the respective value within this argument so that the `useStore` knows to remap your state when the respective externals change in value.

Your `mapState` can either resolve a single piece of state. If you wish to resolve multiple pieces of state then you can either call `useStore` multiple times, or if you like resolve an object within your `mapState` where each property of the object is a resolved piece of state (similar to the `connect` from `react-redux`). The examples will illustrate the various forms.

</p>
</details>

<details>
<summary>Example</summary>
<p>

```javascript
import { useStore } from 'easy-peasy';

const TodoList = () => {
  const todos = useStore(state => state.todos.items);
  return (
    <div>
      {todos.map((todo, idx) => <div key={idx}>{todo.text}</div>)}
    </div>
  );
};
```

</p>
</details>

<details>
<summary>Example resolving multiple values</summary>
<p>

```javascript
import { useStore } from 'easy-peasy';

const BasketTotal = () => {
  const totalPrice = useStore(state => state.basket.totalPrice);
  const netPrice = useStore(state => state.basket.netPrice);
  return (
    <div>
      <div>Total: {totalPrice}</div>
      <div>Net: {netPrice}</div>
    </div>
  );
};
```

</p>
</details>

<details>
<summary>Example resolving multiple values via an object result</summary>
<p>

```javascript
import { useStore } from 'easy-peasy';

const BasketTotal = () => {
  const { totalPrice, netPrice } = useStore(state => ({
    totalPrice: state.basket.totalPrice,
    netPrice: state.basket.netPrice
  }));
  return (
    <div>
      <div>Total: {totalPrice}</div>
      <div>Net: {netPrice}</div>
    </div>
  );
};
```

</p>
</details>

<details>
<summary>A word of caution</summary>
<p>

Please be careful in the manner that you resolve values from your `mapToState`. To optimise the rendering performance of your components we use equality checking (===) to determine if the mapped state has changed.

When an action changes the piece of state your `mapState` is resolving the equality check will break, which will cause your component to re-render with the new state.

Therefore deriving state within your `mapState` in a manner that will always produce a new value (for e.g. an array) is an anti-pattern as it will break our equality checks.

```javascript
// ❗️ Using .map will produce a new array instance every time mapState is called
//                                                     👇
const productNames = useStore(state => state.products.map(x => x.name))
```

You have two options to solve the above.

Firstly, you could just return the products and then do the `.map` outside of your `mapState`:

```javascript
const products = useStore(state => state.products)
const productNames = products.map(x => x.name)
```

Alternatively you could use the [`select`](#selectselector) helper to define derived state against your model itself.

```javascript
import { select, createStore } from 'easy-peasy';

const createStore = ({
  products: [{ name: 'Boots' }],
  productNames: select(state => state.products.map(x => x.name))
});
```

Note, the same rule applies when you are using the object result form of `mapState`:

```javascript
const { productNames, total } = useStore(state => ({
  productNames: state.products.map(x => x.name), // ❗️ new array every time
  total: state.basket.total
}));
```

</p>
</details>

### useActions(mapActions)

A [hook](https://reactjs.org/docs/hooks-intro.html) granting your components access to the store's actions.

<details>
<summary>Arguments</summary>
<p>

  - `mapActions` (Function, required)

    The function that is used to resolved the action(s) that your component requires. Your `mapActions` can either resolve single or multiple actions. The function will receive the following arguments:

    - `actions` (Object, required)

      The `actions` of your store.

</p>
</details>

<details>
<summary>Example</summary>
<p>

```javascript
import { useState } from 'react';
import { useActions } from 'easy-peasy';

const AddTodo = () => {
  const [text, setText] = useState('');
  const addTodo = useActions(actions => actions.todos.add);
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => addTodo(text)}>Add</button>
    </div>
  );
};
```

</p>
</details>

<details>
<summary>Example resolving multiple actions</summary>
<p>

```javascript
import { useState } from 'react';
import { useActions } from 'easy-peasy';

const EditTodo = ({ todo }) => {
  const [text, setText] = useState(todo.text);
  const { saveTodo, removeTodo } = useActions(actions => ({
    saveTodo: actions.todos.save,
    removeTodo: actions.todo.toggle
  }));
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => saveTodo(todo.id)}>Save</button>
      <button onClick={() => removeTodo(todo.id)}>Remove</button>
    </div>
  );
};
```

</p>
</details>

### useDispatch()

A [hook](https://reactjs.org/docs/hooks-intro.html) granting your components access to the store's dispatch.

<details>
<summary>Example</summary>
<p>

```javascript
import { useState } from 'react';
import { useDispatch } from 'easy-peasy';

const AddTodo = () => {
  const [text, setText] = useState('');
  const dispatch = useDispatch();
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => dispatch({ type: 'ADD_TODO', payload: text })}>Add</button>
    </div>
  );
};
```

</p>
</details>

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

### createTypedHooks<StoreModel = {}>()

Allows you to create typed versions of all the hooks so that you don't need to constantly apply typing information against them.

<details>
<summary>Example</summary>
<p>

```typescript
// hooks.js
import { createTypedHooks } from 'easy-peasy';
import { StoreModel } from './model';

const { useActions, useStore, useDispatch } = createTypedHooks<StoreModel>();

export default {
  useActions,
  useStore,
  useDispatch
}
```

And then use your typed hooks in your components:

```typescript
import { useStore } from './hooks';

export default MyComponent() {
  //                          This will be typed
  //                                       👇
  const message = useStore(state => state.message);
  return <div>{message}</div>;
}
```

</p>
</details>

<p>&nbsp;</p>

---

## Tips and Tricks

Below are a few useful tips and tricks when using Easy Peasy.

### Generalising effects/actions/state via helpers

You may identify repeated patterns within your store implementation. It is possible to generalise these via helpers.

For example, say you had the following:

```javascript
const store = createStore({
  products: {
    data: {},
    ids: select(state => Object.keys(state.data)),
    fetched: action((state, products) => {
      products.forEach(product => {
        state.data[product.id] = product;
      });
    }),
    fetch: thunk((actions) => {
      const data = await fetchProducts();
      actions.fetched(data);
    })
  },
  users: {
    data: {},
    ids: select(state => Object.keys(state.data)),
    fetched: action((state, users) => {
      users.forEach(user => {
        state.data[user.id] = user;
      });
    }),
    fetch: thunk((dispatch) => {
      const data = await fetchUsers();
      actions.fetched(data);
    })
  }
})
```

You will note a distinct pattern between the `products` and `users`. You could create a generic helper like so:

```javascript
const data = (endpoint) => ({
  data: {},
  ids: select(state => Object.keys(state.data)),
  fetched: action((state, items) => {
    items.forEach(item => {
      state.data[item.id] = item;
    });
  }),
  fetch: thunk((actions, payload) => {
    const data = await endpoint();
    actions.fetched(data);
  })
})
```

You can then refactor the previous example to utilise this helper like so:

```javascript
const store = createStore({
  products: {
    ...data(fetchProducts)
    // attach other state/actions/etc as you like
  },
  users: {
    ...data(fetchUsers)
  }
})
```

This produces an implementation that is like for like in terms of functionality but far less verbose.

----

## Prior art

This library was massively inspired by the following awesome projects. I tried to take the best bits I liked about them all and create this package. Huge love to all contributors involved in the below.

 - [rematch](https://github.com/rematch/rematch)

   Rematch is Redux best practices without the boilerplate. No more action types, action creators, switch statements or thunks.

 - [react-easy-state](https://github.com/solkimicreb/react-easy-state)

   Simple React state management. Made with ❤️ and ES6 Proxies.

 - [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree)

   Model Driven State Management
