# Store

A store instance contains the following properties:

- `addModel` (Function)

  Allows you to dynamically add a "slice" to your model. Useful in applications
  adopting code splitting strategies that wish to dynamically load slices of
  their models as required.

  ```javascript
  const store = createStore(model);
  store.addModel('todos', {
    items: ['Buy shoes'],
  });
  store.getState().todos.items; // ["Buy shoes"]
  ```

  When executed you will be returned an object containing the following
  properties:

  - `resolveRehydration` (() => Promise)

    If you are utilising [`persist`](/docs/api/persist.html) within your
    dynamically added model, and the configured storage engine is asynchronous
    then you can execute this helper function to get a handle on a `Promise`
    that resolves when the data for your dynamically added model has rehydrated.

- `clearMockedActions` (Function)

  If the `mockActions` configuration value was passed to the `createStore` then
  calling this function clears the list of mocked actions that have been tracked
  by the store. This is useful in the context of testing - especially thunks and
  listeners.

- `dispatch` (Function)

  Allows you to manually dispatch actions, ala Redux.

- `getActions` (Function)

  Returns the actions of your store.

- `getListeners` (Function)

  Returns the listener actions of your store (i.e.
  [actionOn](/docs/api/action-on.html) and [thunkOn](/docs/api/thunk-on.html)).
  Useful if you would like to manually execute a listener for the purpose of
  testing.

- `getMockedActions` (Function)

  If the `mockActions` configuration value was passed to the `createStore` then
  calling this function will return the actions that have been dispatched (and
  mocked). This is useful in the context of testing - especially thunks and
  listeners.

- `getState` (Function)

  Returns the state of your store.

- `persist` (Object)

  This API is useful if you have are making use of
  [`persist`](/docs/api/persist.html) configurations within your model. It
  contains the following properties:

  - `clear` (() => Promise)

    When executed it will clear all data from all the configured persistence
    storage locations.

  - `flush` (() => Promise)

    When executed it will ensure an outstanding persistence operations are
    completed. When they have done so then the Promise will resolve. This is
    particularly helpful in scenarios such as ensuring the persistence has
    completed prior to the user navigating away from your application.

  - `resolveRehydration` (() => Promise)

    When executed returns a Promise that resolves when the store has completed
    the rehydration on state from the persisted storage locations. This is
    useful during the initial rendering of your application. You could await on
    this resolution prior to rendering your application in order to ensure all
    the persisted data has been rehydrated.

- `reconfigure` (Function)

  Allows you to reconfigure the store by providing a new/updated model. The
  existing state of the store will be maintained. This is especially useful in
  supporting hot reloading.

  ```javascript
  const store = createStore(model);
  store.reconfigure(newModel);
  ```

- `removeModel` (Function)

  Allows you to dynamically remove a "slice" from your model. Useful in
  applications adopting code splitting strategies that wish to dynamically
  remove a slices of their model when a specific component tree unmounts.

  ```javascript
  const store = createStore(model);
  store.removeModel('todos');
  store.getState().todos; // undefined
  ```
