# createComponentStore

> **DEPRECATED**
>
> Please use the [`useLocalStore`](/docs/api/use-local-store.html) hook instead.

Allows you to create a store to represent the state for an individual React component. This is essentially an alternative to the official `useState` and `useReducer` hooks provided by React for component-level state.

```javascript
const useCounter = createComponentStore({
  count: 0,
  increment: action(state => {
    state.count += 1;
  })
})
```

## Arguments

  - `model` (Object | (any) => Object, required)

    The model representing your store.

    ```javascript
    createComponentStore({
      count: 0,
      increment: action(state => {
        state.count += 1;
      })
    });
    ```

    Alternatively it accepts a function that receives `initialData` as an argument. The function can then use the `initialData` argument to initialise the model as required. This allows additional runtime configuration/overrides per instance of the store hook usage.

    ```javascript
    createComponentStore(initialData => ({
      count: initialData.count || 0,
      increment: action(state => {
        state.count += 1;
      })
    }));
    ```

    Please see the example below for more detail.

  - `config` (Object, not required)

    Provides custom configuration options for your store. Please see the [StoreConfig](/docs/api/store-config.html) API documentation for a full list of configuration options.

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

## Example

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

## Customising your model at runtime

This example demonstrates how to customise your store via the `initialData` argument.

```javascript
// The initial data will be received here 👇
const useCounter = createComponentStore(initialData => ({
  count: initialData,
  inc: action(state => {
    state.count += 1;
  })
}));

function MyCounter({ initialCount }) {
  // The initial data is provided here   👇
  const [state, actions] = useCounter(initialCount);
  return (
    <>
      <div>{state.count}</div>
      <button onClick={() => actions.inc()} type="button"> + </button>
    </>
  );
}
```

The `initialData` will only be used during the first render of your component. If you would like to reinitialise your store based on an incoming prop you will have to create an action on your store and combine the `useEffect` hook with it.

## Reinitialising your model based on incoming props

There may be cases in which you may want to reinitialise your store based on some incoming props. The store hook will only initialise once for a component, therefore for this case we recommend defining an action/thunk by which to reinitialise your store with, and then combining this with the `useEffect` hook in order to dispatch the action/thunk when the respective prop changes.

```javascript
import { useEffect } from 'react';

const useCounter = createComponentStore({
  count: 0,
  inc: action(state => {
    state.count += 1;
  }),
  // 👇 define an action to help us reinitialise our model.
  setCount: action((state, payload) => {
    state.count = payload;
  })
});

function MyCounter({ initialCount }) {
  const [state, actions] = useCounter();
  // 👇 we use an effect hook to track the prop and dispatch our action
  useEffect(() => {
    actions.setCount(initialCount);
  }, [initialCount])
  return (
    <>
      <div>{state.count}</div>
      <button onClick={() => actions.inc()} type="button"> + </button>
    </>
  );
}
```
