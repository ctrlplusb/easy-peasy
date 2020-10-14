# useLocalStore

Allows you to create a store to represent the state for an individual React component. This is essentially an alternative to the official `useState` and `useReducer` hooks provided by React for component-level state.

```javascript
function MyCounter() {
  const [state, actions] = useLocalStore(() => ({
    count: 0,
    increment: action(_state => {
      _state.count += 1;
    })
  }));

  return (
    <div>
      {state.count}
      <button onClick={() => actions.increment()}>+</button>
    </div>
  );
}
```

## Arguments

  - `modelCreater` ((prevState?: Object) => Object, required)

    A function that should return the model representing your store.

    ```javascript
    useLocalStore(() => ({
      count: 0,
      increment: action(state => {
        state.count += 1;
      })
    });
    ```

    The function receives the following arguments:

    - `prevState` (Object, optional)

      If the store is being recreated (i.e. due to a dependency change), then the previous state will be provided. This allows partial / full state rehydration.

  - `dependencies` (Array, optional, default=[])

    A list of dependencies, similar to the official React hooks. If any of the values change then the store will be recreated. Especially helpful if your store depends on an external value, such as a prop.

    By default an empty array will be used, meaning the store will not be recreated.

  - `storeConfig` ((prevState?: Object, prevConfig?: Object) => Object, optional)

    Provides custom configuration options for your store. Please see the [StoreConfig](/docs/api/store-config.html) API documentation for a full list of configuration options.

    ```javascript
    useLocalStore(
      () => model,
      [],
      () => ({ middleware: [loggerMiddleware] })
    );
    ```

    The function receives the following arguments:

    - `prevState` (Object, optional)

      If the store is being recreated (i.e. due to a dependency change), then the previous state will be provided. This allows partial / full state rehydration.

    - `prevConfig` (Object, optional)

      If the store is being recreated (i.e. due to a dependency change), then the previous config will be provided.

## Returns

The hook returns a positional array;

```typescript
const [state, actions, store] = useLocalStore(/*...*/);
```

- `state`

  The state of your store.

- `actions`

  The actions of your store.

- `store`

  The actual store instance - for advanced cases.

## Example

This example shows how you can use the hook within your component.

```javascript
import { useLocalStore } from 'easy-peasy';

function MyCounter() {
  const [state, actions] = useLocalStore(() => ({
    count: 0,
    inc: action(_state => {
      _state.count += 1;
    })
  }));
  return (
    <>
      <div>{state.count}</div>
      <button onClick={() => actions.inc()} type="button"> + </button>
    </>
  );
}
```

## Reinitialising your model based on incoming props

There may be cases in which you may want to reinitialize your store based on some incoming props. The store hook will only initialize once for each use. To get around this simply define the dependency array, providing a list of props, that when they change will cause the store to be recreated.

```javascript
import { useLocalStore, action } from 'easy-peasy';

function EditProduct({ product }) {
  const [state, actions] = useLocalStore(
    () => ({
      product, // 👈 using state to initialize model
      setPrice: action((_state, payload) => {
        _state.product.price = payload;
      }),
    }),
    [product] // 👈 recreate model every time we receive a different product
  );

  return (
    <>
      <div>{state.product.name}</div>
      <input
        onChange={e => actions.setPrice(e.target.value)}
        value={state.product.price}
      />
    </>
  );
}
```
