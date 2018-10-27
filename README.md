> Note: this package depends on the new [Hooks](https://reactjs.org/docs/hooks-intro.html) feature of React. Currently available via 16.7.0-alpha.0 of React.

<p align='center'>
  <img src="https://i.imgur.com/KHTgPvA.png" width="320" />
</p>
<p align='center'>Easy peasy global state for React</p>

[![npm](https://img.shields.io/npm/v/easy-peasy.svg?style=flat-square)](http://npm.im/easy-peasy)
[![MIT License](https://img.shields.io/npm/l/easy-peasy.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/ctrlplusb/easy-peasy.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/easy-peasy)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/easy-peasy.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/easy-peasy)

```javascript
import { StoreProvider, createStore, useStore, useAction } from 'easy-peasy';

// 👇 create your store
const store = createStore({
  todos: {
    items: ['Install easy-peasy', 'Build app', 'Profit'],
    // 👇 define actions
    add: (state, payload) => {
      state.items.push(payload) // 👈 you mutate state to update (we convert
                                //    to immutable updates)
    }
  }
});

const App = () => (
  // 👇 surround your app with the provider to expose the store to your app
  <StoreProvider store={store}>
    <TodoList />
  </StoreProvider>
)

function TodoList() {
  // 👇 use hooks to get state or actions. you component will automatically
  //    receive updated state
  const todos = useStore(state => state.todos.items)
  const add = useAction(actions => actions.todos.add)
  return (
    <div>
      {todos.map((todo, idx) => <div key={idx}>{todo.text}</div>)}
      <AddTodo onAdd={add} />
    </div>
  )
}
```

## Features

  - Quick to set up, easy to use
  - Update state via simple mutations (thanks [`immer`](https://github.com/mweststrate/immer))
  - Derived state
  - Async actions for remote data fetching/persisting
  - Provides [React Hooks](https://reactjs.org/docs/hooks-intro.html) to interact with the store 😎
  - Powered by Redux
  - Add custom Redux middleware
  - Supports Redux Dev Tools
  - Outputs a standard Redux store for easy integration

<p>&nbsp;</p>
<p align='center'>
  <img src='https://i.imgur.com/2vFSy1y.png' width='500' />
</p>
<p>&nbsp;</p>

## TOCs

  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Examples](#examples)
    - [React Todo List](#react-todo-list)
  - [Tutorial](#tutorial)
    - [Setting up your store](#setting-up-your-store)
    - [Accessing state directly via the store](#accessing-state-directly-via-the-store)
    - [Modifying state via actions](#modifying-state-via-actions)
    - [Dispatching actions directly via the store](#dispatching-actions-directly-via-the-store)
    - [Creating an `effect` action](#creating-an-effect-action)
    - [Dispatching an `effect` action directly via the store](#dispatching-an-effect-action-directly-via-the-store)
    - [Deriving state](#deriving-state)
    - [Accessing Derived State directly via the store](#accessing-derived-state)
    - [Final notes](#final-notes)
  - [Usage with React](#usage-with-react)
    - [Wrap your app with StoreProvider](#wrap-your-app-with-storeprovider)
    - [Consuming state in your Components](#consuming-state-in-your-components)
    - [Firing actions in your Components](#firing-actions-in-your-components)
    - [Alternative usage via react-redux](#alternative-usage-via-react-redux)
  - [API](#api)
    - [createStore(model, config)](#createstoremodel-config)
    - [action](#action)
    - [effect(action)](#effectaction)
    - [select(selector)](#selectselector)
    - [StoreProvider](#storeprovider)
    - [useStore](#useStore)
    - [useAction](#useAction)
  - [Prior Art](#prior-art)

---

## Introduction

Easy Peasy gives you the power of Redux and its tooling whilst avoiding the boilerplate. It allows you to create a full Redux store by defining a simple model (object) to describe your state and it's actions.

Easy Peasy outputs a Redux store, which means you can integrate with frameworks like React. Read the [integration docs](#integration-with-frameworks) below.

---

## Installation

Firsly, ensure you have the correct versions of React (i.e. a version that supports Hooks) installed.

```bash
npm install react@16.7.0-alpha.0
npm install react-dom@16.7.0-alpha.0
```

Then install Easy Peasy.

```bash
npm install easy-peasy
```

Ok, thats it. No more "extra" dependencies for boosted features. It's an all-in-one package. Easy peasy.

---

## Examples

### React Todo List

A simple/naive implementation of a todo list.

https://codesandbox.io/s/woyn8xqk15

---

## Core Concepts

The below will introduce you step by step to all the core concepts of Easy Peasy. At first we will interact with the store directly (remember we output a standard Redux store). After you gain this understanding we show you how to integrate Easy Peasy into your React application.

### Setting up your store

Firstly you need to define your model. This represents the structure of your Redux store along with the default values. It can be as deep and complex as you like.

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

You will now have a [Redux store](https://redux.js.org/api/store). 👍

### Accessing state directly via the store

You can access your store's state using the `getState` API of the store.

```javascript
store.getState().todos.items;
```

### Modifying state via actions

In order to mutate your state you need to define an action against your model.

```javascript
const store = createStore({
  todos: {
    items: [],
    // 👇 our action
    addTodo: (state, payload) => {
      //    Mutate the state directly. Under the hood we convert this to an
      //    an immutable update in the store, but at least you don't need to
      //    worry about being careful to return new instances etc. This also
      // 👇 makes it easy to update deeply nested items.
      state.items.push(payload)
    }
  }
});
```

The action will receive as it's first parameter the slice of the state that it was added to. So in the example above our action would receive `{ items: [] }` as the value for `state`. It will also receive any `payload` that may have been provided when the action was triggered.

### Dispatching actions directly via the store

Easy Peasy will bind your actions against the store's `dispatch` using a path that matches where the action lives within your model. You can dispatch your actions directly via the store, providing any payload that they may require.

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

### Creating an `effect` action

If you wish to perform side effects, such as fetching or persisting from your server then you can use the `effect` helper to declare an effectful action.

```javascript
import { effect } from 'easy-peasy'; // 👈 import the helper

const store = createStore({
  todos: {
    items: [],

    //          👇 define an action surrounding it with the helper
    saveTodo: effect(async (actions, payload) => {
      //                      👆
      // Notice that an effect will receive the actions allowing you to dispatch
      // other actions after you have performed your side effect.
      const saved = await todoService.save(payload);
      // 👇 Now we dispatch an action to add the saved item to our state
      actions.todos.todoSaved(saved);
    }),

    todoSaved: (state, payload) => {
      state.items.push(payload)
    }
  }
});
```

As you can see in the example above you can't modify the state directly within an `effect` action, however, the `effect` action is provided `actions`, allowing you dispatch actions to update the state where required.

### Dispatching an `effect` action directly via the store

You dispatch an effectful action in the same manner as a normal action. However, an `effect` action always returns a Promise allowing you to chain commands to execute after the `effect` action has completed.

```javascript
store.dispatch.todos.saveTodo('Install easy-peasy').then(() => {
  console.log('Todo saved');
})
```

### Deriving state

If you have state that can be derived from state then you can use the [`select`](#select(selector)) helper. Simply attach it to any part of your model.

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

---

## Usage with React

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

In order to use state within your components you can use the `useStore` hook.

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

### Firing actions in your Components

In order to fire actions in your components you can use the `useAction` hook.

```javascript
import { useState } from 'react';
import { useAction } from 'easy-peasy';

const AddTodo = () => {
  const [text, setText] = useState('');
  const addTodo = useAction(actions => actions.todos.add);
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => addTodo(text)}>Add</button>
    </div>
  );
};
```

### Alternative usage via react-redux

As Easy Peasy outputs a standard Redux store it is entirely possible to use Easy Peasy with the official [`react-redux`](https://github.com/reduxjs/react-redux) package.

#### First, install the `react-redux` package

```bash
npm install react-redux
```

#### Then wrap your app with the `Provider`

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

### Finally, use `connect` against your components

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

---

## API

Below is an overview of the API exposed by Easy Peasy.

### createStore(model, config)

Creates a Redux store based on the given model. The model must be an object and can be any depth. It also accepts an optional configuration parameter for customisations.

#### Arguments

  - `model` (Object, required)

    Your model representing your state tree, and optionally containing action functions.

  - `config` (Object, not required)

    Provides custom configuration options for your store. It supports the following options:

    - `devTool` (bool, not required, default=false)

       Setting this to `true` will enable the [Redux Dev Tools Extension](https://github.com/zalmoxisus/redux-devtools-extension).

    - `initialState` (Object, not required, default=undefined)

      Allows you to hydrate your store with initial state (for example state received from your server in a server rendering context).

    - `middleware` (Array, not required, default=[])

      Any additional middleware you would like to attach to your Redux store.

#### Example

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

### action

A function assigned to your model will be considered an action, which can be be used to dispatch updates to your store.

The action will have access to the part of the state tree where it was defined.

It has the following arguments:

  - `state` (Object, required)

    The part of the state tree that the action is against. You can mutate this state value directly as required by the action. Under the hood we convert these mutations into an update against the Redux store.

  - `payload` (Any)

    The payload, if any, that was provided to the action.

When your model is processed by Easy Peasy to create your store all of your actions will be made available against the store's `dispatch`. They are mapped to the same path as they were defined in your model. You can then simply call the action functions providing any required payload.  See the example below.

#### Example

```javascript
import { createStore } from 'easy-peasy';

const store = createStore({
  todos: {
    items: [],
    add: (state, payload) => {
      state.items.push(payload)
    }
  },
  user: {
    preferences: {
      backgroundColor: '#000',
      changeBackgroundColor: (state, payload) => {
        state.backgroundColor = payload;
      }
    }
  }
});

store.dispatch.todos.add('Install easy-peasy');

store.dispatch.user.preferences.changeBackgroundColor('#FFF');
```

### effect(action)

Declares an action on your model as being effectful. i.e. has asynchronous flow.

#### Arguments

  - action (Function, required)

    The action function to execute the effects. It can be asynchronous, e.g. return a Promise or use async/await. Effectful actions cannot modify state, however, they can dispatch other actions providing fetched data for example in order to update the state.

    It accepts the following arguments:

    - `dispatch` (required)

      The Redux store `dispatch` instance. This will have all the Easy Peasy actions bound to it allowing you to dispatch additional actions.

    - `payload` (Any, not required)

      The payload, if any, that was provided to the action.

    - `additional` (Object, required)

      An object containing additional helpers for the action when required. It has the following properties:

      - `getState` (Function, required)

        When executed it will provide the root state of your model. This can be useful in the cases where you require state in the execution of your effectful action.

When your model is processed by Easy Peasy to create your store all of your actions will be made available against the store's `dispatch`. They are mapped to the same path as they were defined in your model. You can then simply call the action functions providing any required payload.  See the example below.

#### Example

```javascript
import { createStore, effect } from 'easy-peasy'; // 👈 import then helper

const store = createStore({
  session: {
    user: undefined,
    // 👇 define your effectful action
    login: effect(async (dispatch, payload) => {
      const user = await loginService(payload)
      dispatch.session.loginSucceeded(user)
    }),
    loginSucceeded: (state, payload) => {
      state.user = payload
    }
  }
});

// 👇 you can dispatch and await on the effectful actions
store.dispatch.session.login({
  username: 'foo',
  password: 'bar'
})
// 👇 effectful actions _always_ return a Promise
.then(() => console.log('Logged in'));

```

### select(selector)

Declares a section of state that is derived via the given selector function.

#### Arguments

  - selector (Function, required)

    The selector function responsible for resolving the derived state. It will be provided the following arguments:

    - `state` (Object, required)

      The local part of state that the `select` property was attached to.

  - dependencies (Array, not required)

    If this selector depends on other selectors your need to pass these selectors in here to indicate that is the case. Under the hood we will ensure the correct execution order.

Select's have their outputs cached to avoid unnecessary work, and will be executed
any time their local state changes.

#### Example

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

#### Example with Dependencies

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

### StoreProvider

Initialises your React application with the store so that your components will be able to consume and interact with the state via the `useStore` and `useAction` hooks.

#### Example

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

### useStore

A [hook](https://reactjs.org/docs/hooks-intro.html) granting your components access to the store's state. You need to provide it with a function which is used to resolved the piece of state that your component requires.

#### Example

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

If you wish to access multiple pieces of state in the same component you can make multiple calls to `useStore`.

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

### useAction

A [hook](https://reactjs.org/docs/hooks-intro.html) granting your components access to the store's actions. You need to provide it with a function which is used to resolved the action that your component requires.

#### Example

```javascript
import { useState } from 'react';
import { useAction } from 'easy-peasy';

const AddTodo = () => {
  const [text, setText] = useState('');
  const addTodo = useAction(actions => actions.todos.add);
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => addTodo(text)}>Add</button>
    </div>
  );
};
```

If you wish to access multiple actions in the same component you can make multiple calls to `useAction`.

---

## Prior art

This library was massively inspired by the following awesome projects. I tried to take the best bits I liked about them all and create this package. Huge love to all contributors involved in the below.

 - [rematch](https://github.com/rematch/rematch)

   Rematch is Redux best practices without the boilerplate. No more action types, action creators, switch statements or thunks.

 - [react-easy-state](https://github.com/solkimicreb/react-easy-state)

   Simple React state management. Made with ❤️ and ES6 Proxies.

 - [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree)

   Model Driven State Management