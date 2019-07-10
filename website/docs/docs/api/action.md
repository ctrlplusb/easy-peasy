# action

Allows you to declare an [action](/docs/api/action) on your model. An [action](/docs/api/action) is used to perform updates on your [store](/docs/api/store).

```javascript
addTodo: action((state, payload) => {
  state.items.push(payload);
})
```

##  Arguments

  - `handler` (Function, *required*)

    The handler for your [action](/docs/api/action). It will receive the following arguments:

    - `state` (Object)

      The part of the state tree that the [action](/docs/api/action) is against. You can mutate this state value directly as required by the [action](/docs/api/action). Under the hood we convert these mutations into an update against the Redux store.

    - `payload` (any)

      The payload, if any, that was provided to the [action](/docs/api/action) when it was dispatched.


## Actions are synchronous

[Actions](/docs/api/action) are executed synchronously, therefore, you can immediately query your [store](/docs/api/store) to see the updated state.

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

Despite the Redux Dev Tools extension being available there may be cases in which you would like to perform a `console.log` within the body of your [actions](/docs/api/action) to aid debugging.

If you try to do so you may not that a `Proxy` object is printed out instead of your expected state. This is due to us using `immer` under the hood, which allows us to track mutation updates to the state and then convert them to immutable updates.

To get around this you can use the [debug](/docs/api/debug) util.

```javascript
import { debug } from 'easy-peasy';

const model = {
  myAction: action((state, payload) => {
    console.log(debug(state));
  })
};
```