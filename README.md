<p align='center'>
  <img src="https://i.imgur.com/KHTgPvA.png" width="320" />
</p>
<p align='center'>Easy peasy redux-powered state management</p>

[![npm](https://img.shields.io/npm/v/easy-peasy.svg?style=flat-square)](http://npm.im/easy-peasy)
[![MIT License](https://img.shields.io/npm/l/easy-peasy.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/ctrlplusb/easy-peasy.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/easy-peasy)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/easy-peasy.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/easy-peasy)

```javascript
import { createStore } from 'easy-peasy';

const store = createStore({
  count: 1,
  inc: (state) => {
    state.count++
  }
});

store.dispatch.inc();

store.getState();
/*
{
  count: 2
}
*/
```

## Features

  - Quick to set up, easy to use
  - Modify your state by simply mutating it
  - Execute async actions for data fetching
  - Supoorts the Redux Dev Tools Extension
  - Supports multiple frameworks (e.g. React via `react-redux`)

## TOCs

  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Tutorial](#tutorial)
    - [Setting up your store](#setting-up-your-store)
    - [Accessing state](#accessing-state)
    - [Modifying state via actions](#modifying-state-via-actions)
    - [Dispatching actions](#dispatching-actions)
    - [Asynchronous actions](#asynchronous-actions)
    - [Final notes](#final-notes)
  - [Config](#config)
  - [Usage with React](#usage-with-react)
  - [API](#api)
    - [createStore(model, config)](#createstoremodel-config)
    - [action](#action)
    - [effect(action)](#effectaction)
  - [Prior Art](#prior-art)

## Introduction

Easy Peasy gives you the power of Redux and its tooling whilst avoiding the boilerplate. It allows you to create a full Redux store by defining a simple model (object) to describe your state and it's actions.

Easy Peasy outputs a Redux store, which means you can easily use it with frameworks like React. Read the integration docs below.

## Installation

```bash
npm install easy-peasy
```

## Tutorial

### Setting up your store

Firstly you need to define your model. This represents the structure of your Redux store along with the default values. It can be as deep and complex as you like.

```javascript
const model = {
  todos: {
    items: [],
  }
};
```

Then you simply pass your model to `createStore`.

```javascript
import { createStore } from 'easy-peasy';

const store = createStore(model);
```

You now have a full featured Redux store. 😎

### Accessing state

To access state you use the standard mechanism provided by the Redux store.

```javascript
store.getState().todos.items;
```

Typically you wouldn't access state like this though, and would utilise a Redux package appropriate for your framework. See our docs on [how to use the store with React](#usage-with-react).

### Modifying state via actions

In order to mutate your state add an action to your model. Easy peasy will automagically map these actions so that you can dispatch them from your app.

```javascript
const store = createStore({
  todos: {
    items: [],
    // 👇 our action
    addTodo: (state, payload) => {
      // 👇 we just mutate the state directly. rad.
      state.items.push(payload)
    }
  }
});
```

The action will receive as it's first parameter the state that relates to. So in our example our action would receive `{ items: [] }` as the value for `state`. It will also receive any `payload` that was provided when the action was dispatched.

> Notice how you mutate the state parameter directly. Yep, you no longer have to worry about returning new object instances to maintain Redux's immutable model - we abstract all of that away for you. You just mutate the state to whatever you need it to be and we will take care of the rest.

### Dispatching actions

Easy Peasy will bind your actions against the store's `dispatch` using a path that matches the actions path in your model. Execute them providing any payload they may require.

```javascript
store.dispatch.todos.addTodo('Install easy-peasy');
//            |------------|
//                  |-- path matches our model (todos.addTodo)
```

Check your state and you should see the update values.

```javascript
store.getState().todos.items;
// ['Install easy-peasy']
```

### Creating an `effect` action

If you wish to do things like data fetching then you can use our `effect` helper to declare an effectful action.

```javascript
import { effect } from 'easy-peasy'; // 👈 import then helper

const store = createStore({
  todos: {
    items: [],

    //          👇 then surround an action with it
    saveTodo: effect(async (dispatch, payload) => {
      const saved = await todoService.save(payload);
      dispatch.todos.todoSaved(saved);
    }),

    todoSaved: (state, payload) => {
      state.items.push(payload)
    }
  }
});
```

You can't modify the state in an `effect` action, however, the `effect` action is provided `dispatch`, allowing you dispatch other standard actions in order to update state where required.  Feel free to use async/await or Promises to help with your async flow.

### Dispatching an `effect` action

You dispatch an effectful action in the same manner as standard actions, but an `effect` action always returns a Promise allowing you to chain something to occur after the `effect` action has completed.

```javascript
store.dispatch.todos.saveTodo('Install easy-peasy').then(() => {
  console.log('Todo saved');
})
```

### Final notes

This was just a brief overview of how to create and interact with an Easy Peasy store. We recommend that you read the section on [Usage with React](#usage-with-react) to see how to effectively use this library in the context of React.

## Config

You can pass the following configuration options to `createStore`:

 - `devTools` (Boolean, default=false)

   Enable support for the [Redux Dev Tools Extension](https://github.com/zalmoxisus/redux-devtools-extension). Highly recommended for development.

Example Usage

```javascript
const store = easyPeasy(model, {
  devTools: true
})
```

## Usage with React

To use `easy-peasy` with React simply leverage the official [`react-redux`](https://github.com/reduxjs/react-redux) package.

### First, install the `react-redux` package

```bash
npm install react-redux
```

### Then wrap your app with the `Provider`

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
import { createStore, effect } from 'easy-peasy';

const store = createStore({
  session: {
    user: undefined,
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
await store.dispatch.session.login({
  username: 'foo',
  password: 'bar'
});

console.log('Logged in');
```

## Prior art

This library was massively inspired by the following awesome projects. I tried to take the best bits I liked about them all and create this package. Huge love to all contributors involved in the below.

 - [rematch](https://github.com/rematch/rematch)

   Rematch is Redux best practices without the boilerplate. No more action types, action creators, switch statements or thunks.

 - [react-easy-state](https://github.com/solkimicreb/react-easy-state)

   Simple React state management. Made with ❤️ and ES6 Proxies.

 - [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree)

   Model Driven State Management