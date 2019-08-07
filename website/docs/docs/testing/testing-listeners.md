# Testing listeners

When testing your listeners there are two types of tests that you can perform.

1. Do they execute when the configured target(s) execute?
2. Does the listener perform the expected?

## Testing if listeners execute in response to target(s)

For this case we recommend making use of the `mockAction` configuration value that is available on the `createStore` configuration. When this is set then any actions that are dispatched will not be executed, instead they will be recorded, along with their payloads.

You can utilise the `getMockedActions` function that is bound against your store instance to get the recorded actions, validating that they are what you expect.

This is perfect for us to establish that our listener was fired when a target executed.

We will be showing an [actionOn](/docs/api/action-on.html) listener within this test, however, this strategy would work equally well for a [thunkOn](/docs/api/thunk-on.html) listener.

Given the following model.

```javascript
import { action, actionOn } from 'easy-peasy';

const model = {
  todos: [],
  logs: [],
  addTodo: action((state, payload) => {
    state.todos.push(payload);
  }),
  onTodoAdded: actionOn(
    actions => actions.addTodo,
    (state, target) => {
      state.logs.push(`Added todo: ${target.payload}`);
    },
  ),
};
```

We could test the `onTodoAdded` action.

```javascript
test('listener gets dispatched when target fires', () => {
  // arrange
  const store = createStore(model, {
    mockActions: true,
  });

  // act
  store.getActions().addTodo('Write docs');

  // assert
  expect(store.getMockedActions()).toMatchObject([
    { type: '@action.addTodo', payload: 'Write docs' },
    {
      type: '@action.onTodoAdded',
      payload: {
        type: '@action.addTodo',
        payload: 'Write docs',
      },
    },
  ]);
});
```

## Testing if the listener performs as expected

We may also want to test that our listeners perform the expected. It is possible to dispatch our listeners manually by using the `store.getListeners()` API. 

When dispatch a listener action it is important to note that a very specific payload structure is expected. This payload becomes the `target` argument to the listener handler.

Below is an overview of the payload object that you need to provide when manually dispatching a listener action:

- `type` (string)

  The type of the target action being responded to. e.g. `"@actions.todos.addTodo"`

- `payload` (any)

  This will contain the same payload of the target action being responded to.

- `result` (any | null)

  When listening to a thunk, if the thunk succeeded and returned a result, the result will be contained within this property.

- `error` (Error | null)

  When listening to a thunk, if the thunk failed, this property will contain the `Error`.

- `resolvedTargets` (Array\<string\>)

  An array containing a list of the resolved targets, resolved by the `targetResolver` function. This aids in performing target based logic within a listener handler.

You need not provide all the values if you know that your listener only uses some of them. You could instead only populate the parts of the `target` object that you expect your listener to be using.

For example, below we will manually dispatch a listener, providing only the payload.

```javascript
store.getListeners().onTodoAdded({
  payload: 'Write docs on testing'
})
```

Once you take these rules into account, you could then follow a similar strategy to [testing actions](/docs/testing/testing-actions.html) for [actionOn](/docs/api/action-on.html) listeners. Equally, you can follow a similar strategy to [testing thunks](/docs/testing/testing-thunks.html) for [actionThunk](/docs/api/thunk-on.html) listeners.

Below we will show an example of how you could test the `onTodoAdded` action that we described within the model above.

```javascript
test('onTodoAdded adds a log entry', () => {
  // arrange
  const store = createStore(model);

  // act
  store.getListeners().onTodoAdded({
    payload: 'Test listeners',
  });

  // assert
  expect(store.getState().logs).toEqual(['Added todo: Test listeners']);
});
```