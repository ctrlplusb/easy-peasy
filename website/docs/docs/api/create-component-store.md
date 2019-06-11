# createComponentStore

Creates a store meant to manage the state for a component.

```javascript
const useCounter = createComponentStore({
  count: 0,
  increment: action(state => {
    state.count += 1;
  })
})
```

## Arguments

The following arguments are accepted:

  - `model` (Object | (any) => Object, required)

    The model representing your store.

    Alternatively this can be a function that accepts `initialData`, which is provided when using the store within your components. The function should then return the model. This allows additional runtime configuration/overrides.

    ```javascript
    createComponentStore({
      count: 0,
      increment: action(state => {
        state.count += 1;
      })
    });
    ```

    _or_

    ```javascript
    createComponentStore(initialData => ({
      count: initialData.count || 0,
      increment: action(state => {
        state.count += 1;
      })
    }));
    ```

  - `config` (Object, not required)

    Provides custom configuration options for your store. Please see the [StoreConfig](#StoreConfig) API documentation for a full list of configuration options.

    ```javascript
    createComponentStore(model, { name: 'Counter' });
    ```

## Returns

When executed you will receive a hook that allows you to use the store within your component.

The hook accepts the following arguments:

 - `initialData` (Any, not required)

   Allows you to provide additional data used to initialise your store's model.  This needs to be used in conjunction with the function form of defining your  model.

   ```javascript
   useCounter({ count: 1 });
   ```

When executing the hook you will receive a tuple (array), that contains the
state and actions for your store respectively.

```javascript
const [state, actions] = useCounter();
```

## Examples

### Integration example

This examples shows how you can use the store within your component.

```javascript
const useCounter = createComponentStore({
  count: 0,
  inc: action(state => {
    state.count += 1;
  })
})

function MyCounter() {
  const [state, actions] = useCounter();
  return (
    <>
      <div>{state.count}</div>
      <button onClick={() => actions.inc()} type="button"> + </button>
    </>
  );
}
```

### Customising your model at runtime

This example shows how you can use the `initialData` prop of the store hook in order to customise your model at runtime.

```javascript
// The initial data will be received here 👇
const useCounter = createComponentStore(initialData => ({
  count: initialData.count,
  inc: action(state => {
    state.count += 1;
  })
}));

function MyCounter() {
  // Provide the initial data             👇
  const [state, actions] = useCounter({ count: 1 });
  return (
    <>
      <div>{state.count}</div>
      <button onClick={() => actions.inc()} type="button"> + </button>
    </>
  );
}
```

