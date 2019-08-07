# action

Allows you to declare an [action](/docs/api/action.html) on your model. An [action](/docs/api/action.html) is used to perform updates on your [store](/docs/api/store.html).

```javascript
addTodo: action((state, payload) => {
  state.items.push(payload);
})
```

##  Arguments

  - `handler` (Function, *required*)

    The handler for your [action](/docs/api/action.html). It will receive the following arguments:

    - `state` (Object)

      The part of the state tree that the [action](/docs/api/action.html) is against. You can mutate this state value directly as required by the [action](/docs/api/action.html). Under the hood we convert these mutations into an update against the Redux store.

    - `payload` (any)

      The payload, if any, that was provided to the [action](/docs/api/action.html) when it was dispatched.


## Actions are synchronous

[Actions](/docs/api/action.html) are executed synchronously, therefore, you can immediately query your [store](/docs/api/store.html) to see the updated state.

```javascript
store.getActions().todos.addTodo('Learn Easy Peasy');

store.getState().todos.items;
// ["Learn Easy Peasy"]
```

## Debugging Actions

Ensure you have the [Redux Dev Tools](https://github.com/zalmoxisus/redux-devtools-extension) extension installed. This will allow you to see your dispatched actions, with their payload and the effect that they had on your state.

<img src="../../assets/devtools-action.png" />

## Example

This example demonstrates how to both define an action and consume it from a React component.

```javascript
import { action, createStore, useStoreActions } from 'easy-peasy';

const store = createStore({
  total: 0,
  add: action((state, payload) => {
    state.total += payload;
  })
});

function Add10Button() {
  const add = useStoreActions(actions => actions.add);
  return <button onClick={() => add(10)}>Add 10</button>;
}
```

## Using console.log within actions

Despite the Redux Dev Tools extension being available there may be cases in which you would like to perform a `console.log` within the body of your [actions](/docs/api/action.html) to aid debugging.

If you try to do so you may not that a `Proxy` object is printed out instead of your expected state. This is due to us using `immer` under the hood, which allows us to track mutation updates to the state and then convert them to immutable updates.

To get around this you can use the [debug](/docs/api/debug.html) util.

```javascript
import { debug } from 'easy-peasy';

const model = {
  myAction: action((state, payload) => {
    console.log(debug(state));
  })
};
```

## Don't destructure the state argument

In order to support the mutation API we utilise [immer](https://github.com/mweststrate/immer). Under the hood immer utilises Proxies in order to track our mutations, converting them into immutable updates. Therefore if you destructure the state that is provided to your action you break out of the Proxy, after which any update you perform to the state will not be applied.

Below are a couple examples of this antipattern.

```javascript
addTodo: action(({ items }, payload) => {
  items.push(payload);
})
```

_or_

```javascript
addTodo: action((state, payload) => {
  const { items } = state;
  items.push(payload);
})
```

## Switching to an immutable API

By default we use [immer](https://github.com/mweststrate/immer) to provide a mutation based API. 

If you prefer to explicitly return new immutable state you set the `disableImmer` [configuration](/docs/api/store-config.html) value of [createStore](/docs/api/create-store.html). 

Doing so will disable `immer` and require you to return new immutable state within your actions.

```javascript
import { createStore, action } from 'easy-peasy';

const model = {
  todos: [],
  addTodo: action((state, payload) => {
    // 👇 new immutable state returned
    return [...state, payload];
  })
}

const store = createStore(model, {
  disableImmer: true // 👈 set the flag
})
```

If you don't set this flag and return new immutable state you may experience errors when utilising [computed](/docs/api/computed.html) properties, so it is best to disable `immer` explicitly.
