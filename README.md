> Note: this package depends on the new [Hooks](https://reactjs.org/docs/hooks-intro.html) feature of React. Currently available via 16.8+ of React.

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
import { StoreProvider, createStore, useStore, useAction } from 'easy-peasy';

// 👇 create your store, providing the model
const store = createStore({
  todos: {
    items: ['Install easy-peasy', 'Build app', 'Profit'],
    // 👇 define actions directly on your model
    add: (state, payload) => {
      // do simple mutation to update state, and we make it an immutable update
      state.items.push(payload)
      // (you can also return a new immutable instance if you prefer)
    }
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
  const add = useAction(dispatch => dispatch.todos.add)
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
  - Update state via simple mutations
  - Derived state
  - "Effect" actions for data fetching/persisting
  - Provides [React Hooks](https://reactjs.org/docs/hooks-intro.html)
  - Supports React Native
  - Powered by Redux with full interop
    - Redux Dev Tools support
    - provide custom middleware
    - customise root reducer enhancer
    - easy migration path for traditional styled Redux apps

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
  - [Core Concepts](#core-concepts)
    - [Creating the store](#creating-the-store)
    - [Accessing state directly via the store](#accessing-state-directly-via-the-store)
    - [Modifying state via actions](#modifying-state-via-actions)
    - [Dispatching actions directly via the store](#dispatching-actions-directly-via-the-store)
    - [Creating an `effect` action](#creating-an-effect-action)
    - [Dispatching an `effect` action directly via the store](#dispatching-an-effect-action-directly-via-the-store)
    - [Deriving state via `select`](#deriving-state-via-select)
    - [Accessing Derived State directly via the store](#accessing-derived-state)
    - [Final notes](#final-notes)
  - [Usage with React](#usage-with-react)
    - [Wrap your app with StoreProvider](#wrap-your-app-with-storeprovider)
    - [Consuming state in your Components](#consuming-state-in-your-components)
    - [Firing actions in your Components](#firing-actions-in-your-components)
    - [Alternative usage via react-redux](#alternative-usage-via-react-redux)
  - [Usage with React Native](#usage-with-react-native)
    - [Remote Redux Dev Tools](#remote-redux-dev-tools)
  - [Usage with Typescript](#usage-with-typescript)
  - [API](#api)
    - [createStore(model, config)](#createstoremodel-config)
    - [action](#action)
    - [effect(action)](#effectaction)
    - [reducer(fn)](#reducerfn)
    - [select(selector)](#selectselector)
    - [listeners(attach)](#listenersattach)
    - [StoreProvider](#storeprovider)
    - [useStore(mapState, externals)](#usestoremapstate-externals)
    - [useAction(mapAction)](#useactionmapaction)
  - [Tips and Tricks](#tips-and-tricks)
    - [Generalising effects/actions/state via helpers](#generalising-effectsactionsstate-via-helpers)
  - [Prior Art](#prior-art)

<p>&nbsp;</p>

---

## Introduction

Easy Peasy gives you the power of Redux (and its tooling) whilst avoiding the boilerplate. It allows you to create a full Redux store by defining a model that describes your state and it's actions. Batteries are included - you don't need to configure any additional packages to support derived state, side effects, or integration with React.

<p>&nbsp;</p>

---

## Installation

First, ensure you have the correct versions of React (i.e. a version that supports Hooks) installed.

```bash
npm install react@^16.8.0
npm install react-dom@^16.8.0
```

Then install Easy Peasy.

```bash
npm install easy-peasy
```

You're off to the races.

<p>&nbsp;</p>

---

## Examples

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

The action will receive as its first parameter the slice of the state that it was added to. So in the example above our action would receive `{ items: [] }` as the value for `state`. It will also receive any `payload` that may have been provided when the action was triggered.

> Note: Some prefer not to use a mutation based API. You can return new "immutable" instances of your state if you prefer:
>
> ```javascript
> addTodo: (state, payload) => {
>   return { ...state, items: [...state.items, payload] };
> }
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

### Creating an `effect` action

If you wish to perform side effects, such as fetching or persisting data from your server then you can use the `effect` helper to declare an effectful action.

```javascript
import { effect } from 'easy-peasy'; // 👈 import the helper

const store = createStore({
  todos: {
    items: [],

    //          👇 define an action surrounding it with the helper
    saveTodo: effect(async (dispatch, payload, getState) => {
      //                      👆
      // Notice that an effect will receive the actions allowing you to dispatch
      // other actions after you have performed your side effect.
      const saved = await todoService.save(payload);
      // 👇 Now we dispatch an action to add the saved item to our state
      dispatch.todos.todoSaved(saved);
    }),

    todoSaved: (state, payload) => {
      state.items.push(payload)
    }
  }
});
```

As you can see in the example above you can't modify the state directly within an `effect` action, however, the `effect` action is provided `dispatch`, allowing you dispatch actions to update the state where required.

### Dispatching an `effect` action directly via the store

You dispatch an effectful action in the same manner as a normal action. However, an `effect` action always returns a Promise allowing you to chain commands to execute after the `effect` action has completed.

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

With the new [Hooks](https://reactjs.org/docs/hooks-intro.html) feature introduced in React v16.7.0 it's never been easier to provide a mechanism to interact with global state in your components. We have provided two hooks, allowing you to access the state and actions from your store.

If you aren't familiar with hooks yet we highly recommend that you read the [official documentation](https://reactjs.org/docs/hooks-intro.html) and try playing with our [examples](#examples). Hooks are truly game changing and will simplify your components dramatically.

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

In order to fire actions in your components you can use the `useAction` hook.

```javascript
import { useState } from 'react';
import { useAction } from 'easy-peasy';

const AddTodo = () => {
  const [text, setText] = useState('');
  const addTodo = useAction(dispatch => dispatch.todos.add);
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => addTodo(text)}>Add</button>
    </div>
  );
};
```

For more on how you can use this hook please ready the API docs for the [`useAction` hook](#useactionmapaction).

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

#### Finally, use `connect` against your components

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

<p>&nbsp;</p>

---

## Usage with React Native

Easy Peasy is platform agnostic but makes use of features that may not be available in all environments.

### Remote Redux Dev Tools

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


<p>&nbsp;</p>

---

## Usage with Typescript

Easy Peasy has full support for Typescript. Detailed documentation is coming soon, however you can view the [original PR](https://github.com/ctrlplusb/easy-peasy/pull/57) for an example on how to use Typescript effectively.

<p>&nbsp;</p>

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

    - `compose` (Function, not required, default=undefined)

       Custom [`compose`](https://redux.js.org/api/compose) function that will be used in place of the one from Redux or Redux Dev Tools. This is especially useful in the context of React Native and other environments. See the Usage with React Native notes.

    - `devTools` (bool, not required, default=true)

       Setting this to `true` will enable the [Redux Dev Tools Extension](https://github.com/zalmoxisus/redux-devtools-extension).

    - `disableInternalSelectFnMemoize` (bool, not required, default=false)

      Setting this to `true` will disable the automatic memoisation of a fn that you may return in any of your [`select`](#selectselector) implementations. Please see the respective helpers documentation for more information.

    - `initialState` (Object, not required, default=undefined)

      Allows you to hydrate your store with initial state (for example state received from your server in a server rendering context).

    - `injections` (Any, not required, default=undefined)

      Any dependencies you would like to inject, making them available to your effect actions. They will become available as the 4th parameter to the effect handler. See the [effect](#effectaction) docs for more.

    - `middleware` (Array, not required, default=[])

      Any additional middleware you would like to attach to your Redux store.

    - `reducerEnhancer` (Function, not required, default=(reducer => reducer))

      Any additional reducerEnhancer you would like to enhance to your root reducer (for example you want to use [redux-persist](https://github.com/rt2zz/redux-persist)).

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

    - `getState` (Function, required)

      When executed it will provide the root state of your model. This can be useful in the cases where you require state in the execution of your effectful action.

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
          fetchById: effect((dispatch, payload, getState, injections, meta) => {
            console.log(meta);
            // {
            //   parent: ['products'],
            //   path: ['products', 'fetchById']
            // }
          })
        }
      });

      await store.dispatch.products.fetchById()
      ```

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

#### Example accessing State via the getState parameter

```javascript
import { createStore, effect } from 'easy-peasy';

const store = createStore({
  foo: 'bar',
  // getState allows you to gain access to the  store's state
  //                                               👇
  doSomething: effect(async (dispatch, payload, getState, injections) => {
    // Calling it exposes the root state of your store. i.e. the full
    // store state 👇
    console.log(getState())
    // { foo: 'bar' }
  }),
});

store.dispatch.doSomething()
```


#### Example with Dependency Injection

```javascript
import { createStore, effect } from 'easy-peasy';
import api from './api' // 👈 a dependency we want to inject

const store = createStore(
  {
    foo: 'bar',
    //                              injections are exposed here 👇
    doSomething: effect(async (dispatch, payload, getState, injections) => {
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

### reducer(fn)

Declares a section of state to be calculated via a "standard" reducer function - as typical in Redux. This was specifically added to allow for integrations with existing libraries, or legacy Redux code.

Some 3rd party libraries, for example [`connected-react-router`](https://github.com/supasate/connected-react-router), require you to attach a reducer that they provide to your state. This helper will you achieve this.

#### Arguments

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

#### Example

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

### select(selector)

Attach derived state (i.e. is calculated from other parts of your state) to your store.

The results of your selectors will be cached, and will only be recomputed if the state that they depend on changes. You may be familiar with `reselect` - this feature provides you with the same benefits.

#### Arguments

  - selector (Function, required)

    The selector function responsible for resolving the derived state. It will be provided the following arguments:

    - `state` (Object, required)

      The local part of state that the `select` property was attached to.

    You can return any derived state you like.

    It also supports returning a function. This allows you to support creating a "dynamic" selector that accepts arguments (e.g. `productById(1)`). We will automatically optimise the function that you return - ensuring that any calls to the function will be automatically be memoised - i.e. calls to it with the same arguments will return cached results. This automatic memoisation of the function can be disabled via the `disableInternalSelectFnMemoize` setting on the `createStore`'s config argument.

  - dependencies (Array, not required)

    If this selector depends on data from other selectors then you should provide the respective selectors within an array to indicate the case. This allows us to make guarantees of execution order so that your state is derived in the manner you expect it to.

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

#### Example with arguments

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

### listeners(attach)

Allows you to attach listeners to any action from your model, which will then be fired after the targetted action is exectuted.

This enables parts of your model to respond to actions being fired in other parts of your model. For example you could have a "notifications" model that populates based on certain actions being fired (logged in, product added to basket, etc).

Note: If any action being listened to does not complete successfully (i.e. throws an exception), then no listeners will be fired.

```javascript
const model = {
  ...,
  notificationlisteners: listeners((actions, on) => {
    on(actions.user.loggedIn, (dispatch) => {
      dispatch.notifications.set('User logged in');
    })
  })
};
```

#### Arguments

  - attach (Function, required)

    The attach callback function allows you to attach the listeners to specific actions. It is provided the following arguments:

    - `actions` (Object, required)

      The actions (and effects) of the store.

    - `on` (Function, required)

      Allows you to attach a listener to an action. It expects the following arguments:

      - `action` (Function, required)

        The target action you wish to listen to - you provide the direct reference to the action.

      - `handler` (Function, required)

        The handler function to be executed after the target action is fired successfully. It will receive the following arguments:

        - `dispatch` (required)

          The Redux store `dispatch` instance. This will have all the Easy Peasy actions bound to it allowing you to dispatch additional actions.

        - `payload` (Any, not required)

          The original payload that the targetted action received.

        - `getState` (Function, required)

          When executed it will provide the root state of your model.

        - `injections` (Any, not required, default=undefined)

          Any dependencies that were provided to the `createStore` configuration will be exposed as this argument. See the [`createStore`](#createstoremodel-config) docs on how to specify them.

#### Example

```javascript
import { listeners } from 'easy-peasy'; // 👈 import the helper

const store = createStore({
  user: {
    token: '',
    loggedIn: (state, payload) => {
      state.token = payload;
    },
    logIn: effect(async (dispatch, payload) => {
      const token = await loginService(payload);
      dispatch.user.loggedIn(token);
    },
    logOut: (state) => {
      state.token = '';
    }
  },
  audit: {
    logs: [],
    add: (state, payload) => {
      state.logs.push(payload)
    },
    //  👇 name your listeners
    userListeners: listeners((actions, on) => {
      // 👇 we attach a listener to the "logIn" effect
      on(actions.user.logIn, (dispatch, payload) => {
        dispatch.audit.add(`${payload.username} logged in`);
      });
      // 👇 we attach a listener to the "logOut" action
      on(actions.user.logOut, dispatch => {
        dispatch.audit.add('User logged out');
      });
    }))
  }
});

// 👇 the login effect will fire, and then any listeners will execute after complete
store.dispatch.user.login({ username: 'mary', password: 'foo123' });
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

### useStore(mapState, externals)

A [hook](https://reactjs.org/docs/hooks-intro.html) granting your components access to the store's state.

#### Arguments

  - `mapState` (Function, required)

    The function that is used to resolved the piece of state that your component requires. The function will receive the following arguments:

    - `state` (Object, required)

      The root state of your store.

  - `externals` (Array of any, not required)

    If your `useStore` function depends on an external value (for example a property of your component), then you should provide the respective value within this argument so that the `useStore` knows to remap your state when the respective externals change in value.

Your `mapState` can either resolve a single piece of state. If you wish to resolve multiple pieces of state then you can either call `useStore` multiple times, or if you like resolve an object within your `mapState` where each property of the object is a resolved piece of state (similar to the `connect` from `react-redux`). The examples will illustrate the various forms.

#### Example

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

#### Example resolving multiple values

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

#### Example resolving multiple values via an object result

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

#### A word of caution

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

### useAction(mapAction)

A [hook](https://reactjs.org/docs/hooks-intro.html) granting your components access to the store's actions.

#### Arguments

  - `mapAction` (Function, required)

    The function that is used to resolved the action that your component requires. The function will receive the following arguments:

    - `dispatch` (Object, required)

      The `dispatch` of your store, which has all the actions mapped against it.

Your `mapAction` can either resolve a single action. If you wish to resolve multiple actions then you can either call `useAction` multiple times, or if you like resolve an object within your `mapAction` where each property of the object is a resolved action. The examples below will illustrate these options.

#### Example

```javascript
import { useState } from 'react';
import { useAction } from 'easy-peasy';

const AddTodo = () => {
  const [text, setText] = useState('');
  const addTodo = useAction(dispatch => dispatch.todos.add);
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => addTodo(text)}>Add</button>
    </div>
  );
};
```

#### Example resolving multiple actions via an object map

```javascript
import { useState } from 'react';
import { useAction } from 'easy-peasy';

const EditTodo = ({ todo }) => {
  const [text, setText] = useState(todo.text);
  const { saveTodo, removeTodo } = useAction(dispatch => ({
    saveTodo: dispatch.todos.save,
    removeTodo: dispatch.todo.toggle
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

<p>&nbsp;</p>

----

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
    fetched: (state, products) => {
      products.forEach(product => {
        state.data[product.id] = product;
      });
    },
    fetch: effect((dispatch) => {
      const data = await fetchProducts();
      dispatch.products.fetched(data);
    })
  },
  users: {
    data: {},
    ids: select(state => Object.keys(state.data)),
    fetched: (state, users) => {
      users.forEach(user => {
        state.data[user.id] = user;
      });
    },
    fetch: effect((dispatch) => {
      const data = await fetchUsers();
      dispatch.users.fetched(data);
    })
  }
})
```

You will note a distinct pattern between the `products` and `users`. You could create a generic helper like so:

```javascript
import _ from 'lodash';

const data = (endpoint) => ({
  data: {},
    ids: select(state => Object.keys(state.data)),
    fetched: (state, items) => {
      items.forEach(item => {
        state.data[item.id] = item;
      });
    },
    fetch: effect((dispatch, payload, getState, injections, meta) => {
      //                                                     👆
      // We can get insight into the path of the effect via the "meta" param
      const data = await endpoint();
      // Then we utilise lodash to map to the expected location for our
      // "fetched" action
      //                 👇
      const fetched = _.get(dispatch, meta.parent.concat(['fetched']));
      fetched(data);
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
