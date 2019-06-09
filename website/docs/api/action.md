# action

Allows you to declare an action on your model. An action is used to perform
updates on your store. They specifically have access to the part of your
state tree against which they were defined.

```javascript
action((state, payload) => {
  state.items.push(payload);
})
```

When your model is processed by Easy Peasy all of your actions are bound against
the store's `actions` property.

##  Arguments

  - `state` (Object, required)

    The part of the state tree that the action is against. You can mutate this state value directly as required by the action. Under the hood we convert these mutations into an update against the Redux store.

  - `payload` (Any)

    The payload, if any, that was provided to the action when it was dispatched.

## Integrated Example

```javascript
import { action, createStore, useStoreActions } from 'easy-peasy';

const store = createStore({
  total: 0,
  add: (state, payload) => {
    state.total += payload;
  }
});

function Add10Button() {
  const add = useStoreActions(actions => actions.add);
  return <button onClick={() => add(10)}>Add 10</button>;
}
```