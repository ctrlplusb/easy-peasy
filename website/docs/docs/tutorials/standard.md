# Standard Tutorial

This tutorial will provide you with an indepth insight into the "core" APIs of Easy Peasy. Usage of these APIs are considered enough to satisfy the 90% case state requirements for React applications.

- [Introducing the Model](#introducing-the-model)
  - [State](#state)
  - [Actions](#actions)
    - [Arguments](#arguments)
    - [Modifying the state](#modifying-the-state)
    - [Scoping Actions](#scoping-actions)
    - [Rules](#rules)
- [Creating a Store](#creating-a-store)
  - [Some fun facts about the store](#some-fun-facts-about-the-store)
- [Connecting the Store](#connecting-the-store)
- [Using the Store](#using-the-store)
  - [State](#state-1)

## Introducing the Model

Easy Peasy store's are focussed on model based definitions. Models are plain old javascript objects which can be as wide (lots of properties) or deep (lots of nested objects) as you like.

We use models to represent _everything_ about your store - the state, the actions that can be performed on it, the encapsulated side effects, computed properties etc.

We'll start off by focussing on state and actions.

### State

Below is a simple model with a basic state structure containing a list of todos.

```javascript
const model = {
  todos: [],
};
```

As stated, we support complex state structures, nesting our models as we like.

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

The above example starts to represent more of a typical real world state structure.

As your application scales you can refactor your model to be composed of imports.

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

As models are just plain old javascript objects you have a great deal of flexibility in how you structure and compose your model.

### Actions

In order to perform updates against your state you need to define an [action](/docs/api/action.html) against your model.

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

#### Arguments

Firstly, note how the action receives a `state` argument. This argument will contain the state that is local to the action, so in this case the value of the `state` argument would be:

```json
{
  "todos": []
}
```

The second argument, the `payload`, is any value that was provided to the action when it was dispatched. If no value was provided to the action when it was dispatched it will be `undefined`.

#### Modifying the state

Within the body of the action you can perform an update to the state, utilizing the `payload` if it was provided to influence the update.

Updates are performed by mutating the `state` argument directly.

This might be peculiar to you, especially if you are familiar with Redux. Under the hood we convert these mutations into the equivalent immutable updates against the state via the amazing [Immer](https://immerjs.github.io/immer/) library.

For example the action that previously defined would be automatically converted into the following equivalent operation.

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

In our opinion a mutation based API provides a much better developer experience than having to manage immutability yourself. That being said, if you prefer to do so you can write your actions like this, returning new immutable instances of the `state` argument.

#### Scoping Actions

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

Notice how the action is receiving the state that is local to it. i.e. the `state` argument contains the following value.

```json
{
  "productsInBasket": []
}
```

#### Rules

Actions should only be used to perform updates to your store. You should not perform side effects, such as calling an API, within an action. Doing so would lead to inconsistent behaviour.

We'll later introduce thunks, which allow you to perform side effects.

## Creating a Store

Once you have your model defined you can create a store.

```javascript
import { createStore } from 'easy-peasy';
import model from './model';

const store = createStore(model);
```

The [createStore](/docs/api/create-store.html) function accepts an optional second argument allowing you to pass [configuration options](/docs/api/store-config.html).

For example, if we were rehydrating a server side rendered application we could provide the initial state to our store, which is typically return with the server response.

```javascript
const store = createStore(model, {
  initialState: serverRenderedState,
});
```

### Some fun facts about the store

**1. It's a Redux store**

The store instance that is created is in fact just a Redux store (with a few enhancements added). Therefore you could use it with anything that expects a Redux store.

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

**2. It's a Redux store**

It's worth stressing this point, as you can use all the [APIs](https://redux.js.org/api/store) of a standard [Redux store](https://redux.js.org/api/store).

```javascript
store.subscribe(() => {
  console.log('A state changed occurred');
});
```

**3. It's not just a Redux store**

😅

Ok, so we have made a [few enhancements to the API](/docs/api/store.html), extending the standard [Redux store API](https://redux.js.org/api/store) with some Easy Peasy specific APIs. An example of one below.

```javascript
import store from './my-easy-peasy-store';

store.getActions().addTodo('Learn Easy Peasy');
```

In the above we are using one of the [extended APIs](/docs/api/store.html) to get the actions defined in our model. We are then dispatching the `addTodo` action, providing it a payload of `"Learn Easy Peasy"`.

You can read more about the extended API [here](/docs/api/store.html).

## Connecting the Store

To utilize the store within your React application you need to wrap your application with the [StoreProvider](/docs/api/store-provider.html), providing it your Easy Peasy store.

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

A very similar experience when compared to using `react-redux`.

## Using the Store

Easy Peasy ships with a variety of hooks allowing for convenient interaction with the store from your components.

### State

To consume state within your components utilize the [useStoreState](/docs/api/use-store-state.md) hook.

```javascript
import { useStoreState } from 'easy-peasy';
```
