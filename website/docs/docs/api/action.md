# action

Allows you to declare an action on your model. An action is used to perform updates on your [store](/docs/api/store). Actions will have access to the state that is local to them.

```javascript
action((state, payload) => {
  state.items.push(payload);
})
```

##  Arguments

  - `handler` (Function, *required*)

    The handler for your action. It will receive the following arguments:

    - `state` (Object)

      The part of the state tree that the action is against. You can mutate this state value directly as required by the action. Under the hood we convert these mutations into an update against the Redux store.

    - `payload` (any)

      The payload, if any, that was provided to the action when it was dispatched.

  - `options` (Object, *optional*)

    Additional configuration for the action. It current supports the following
    properties:

    - `listenTo` (Action Reference | Thunk Reference | string, *optional*)

      Setting this makes your action perform as a listener. Any time the
      target action, thunk, or string named action is successfully processed
      then this action will be fired.

      It will receive the same payload as was supplied to the target action.

      ```javascript
      const auditModel = {
        logs: [],
        onTodoAdded: action(
          (state, payload) => {
            state.logs.push(`Added todo: ${payload.text}`);
          },
          { listenTo: todosModel.addTodo }
        )
      };
      ```

      This helps to promote a reactive model and allows for seperation of
      concerns.

## Examples

### Integrated Example

This example demonstrates how to both define an action and consume it from
a React component.

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

### Listener action

This example will demonstrate how to create an action that acts as a *listener* - i.e. it will be fired when a *target* action or thunk has successfully completed.  When the *listener* is dispatched, it will receive the same payload that was provided to the *target*.

An example use case for this would be the need to clear some state when a user logs out of your application, or if you would like to create an audit trail for when certain actions are fired.

```javascript
const todosModel = {
  items: [],
  //  👇 the target action
  addTodo: action((state, payload) => {
    state.items.push(payload);
  })
};

const auditModel = {
  logs: [],
  // 👇 the listener
  onAddTodo: action(
    (state, payload) => {
      state.logs.push(`Added todo: ${payload.text}`);
    },
    { listenTo: todosModel.addTodo } // 👈 declare the target to listen to
  )
};
```

In the example above note that the `onAddTodo` action has been provided a configuration, with the `addTodo` action being set as a target.

Any time the `addTodo` action completes successfully, the `onAddTodo` will be fired, receiving the same payload as what `addTodo` received.

> You can manually dispatch `onAddTodo` as you would any other action, although
> we would recommend you only use this approach for testing your action.

### Using console.log within actions

Despite the Redux Dev Tools extension being available there may be cases in which you would like to perform a `console.log` within the body of your actions to aid debugging.

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