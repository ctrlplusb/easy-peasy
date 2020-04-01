# persist

This helper allows you to persist your store state (by default to `sessionStorage`), allowing it to be rehydrated when your application is remounted (e.g. on page refresh).

> This API is _heavily_ inspired by [`redux-persist`](https://github.com/rt2zz/redux-persist), with the intention of providing a lot of compatibility with it so that we can leverage the packages that exist within it's ecosystem.

To utilise this feature you simply need to wrap your model with the helper.

```javascript
const store = createStore(
  persist({
    count: 1,
    inc: action(state => {
      state.count += 1;
    })
  })
);
```

Every time the state changes it will be saved to the configured storage engine (`sessionStorage` by default).

When your application is freshly mounted, e.g. on a page refresh, any data that exists within the configured storage engine will be used to rehydrate your state accordingly.

```javascript
const store = createStore(model); // state is automatically rehydrated

// Application then renders with rehydrated state
const app = (
  <StoreProvider store={store}>
    <MyApp />
  </StoreProvider>
);
```

## API

Below is the API of the `persist` helper, however, you should be aware that [Store](/docs/api/store.html) instances contain additional APIs relating to persistence. Such as being able to flush persistence prior to navigating away from your application, or awaiting for persisted data to be rehydrated prior to rendering your application. We highly recommend you read the respective [Store](/docs/api/store.html) API docs.

  - `model` (Object, *required*)

    The model that you wish to apply persistence to.

    > You can surround your entire model, or a nested model. You can even have multiple `persist` configurations scattered throughout your store's model. Feel free to use the API on the parts of your state feel most appropriate for persistence/rehydration.

  - `config` (Object, *optional*)

    The persistence configuration. It supports the following properties:

    - `blacklist` (Array<string>, *optional*)

      A list of keys, representing the parts of the model that should not be persisted. Any part of the model that is not represented in this list will be persisted.

    - `whitelist` (Array<string>, *optional*)

      A list of keys, representing the parts of the model that should be persisted. Any part of the model that is not represented in this list will not be persisted.

    - `mergeStrategy` (string, *optional*)

      The strategy that should be employed when rehydrating the persisted state over your store's initial state.

      The following values are supported:

      - `'merge'` (*default*)

        The data from the persistence will be _shallow_ merged with the initial state represented by your store's model.

        i.e.

        Given the following persisted state:

        ```json
        {
          "fruit": "apple",
          "address": {
            "city": "cape town"
          }
        }
        ```

        And the following initial state represented by your store's model:

        ```json
        {
          "address": {
            "city": "london",
            "post code": "e3 1pq"
          },
          "animal": "dolphin"
        }
        ```

        The resulting state will be:

        ```json
        {
          "fruit": "apple",
          "address": {
            "city": "cape town"
          },
          "animal": "dolphin"
        }
        ```

      - `'overwrite'`

        The data from the persistence will _completely_ overwrite the initial state represented by your store's model.

        i.e.

        Given the following persisted state:

        ```json
        {
          "fruit": "apple",
          "city": "cape town"
        }
        ```

        And the following initial state represented by your store's model:

        ```json
        {
          "fruit": "pear",
          "animal": "dolphin"
        }
        ```

        The resulting state will be:

        ```json
        {
          "fruit": "apple",
          "city": "cape town"
        }
        ```

      - `'mergeDeep'`

        The data from the persistence will be merged deeply, recursing through all _object_ structures and merging.

        i.e.

        Given the following persisted state:

        ```json
        {
          "fruit": "apple",
          "address": {
            "city": "cape town"
          }
        }
        ```

        And the following initial state represented by your store's model:

        ```json
        {
          "address": {
            "city": "london",
            "post code": "e3 1pq"
          },
          "animal": "dolphin"
        }
        ```

        The resulting state will be:

        ```json
        {
          "fruit": "apple",
          "address": {
            "city": "cape town",
            "post code": "e3 1pq"
          },
          "animal": "dolphin"
        }
        ```

        > **Note:** Only *plain objects* will be recursed and merged; no other types such as Arrays, Maps, Sets, Classes etc.

    - `transformers` (Array<Transformer>, *optional*)

      Transformers are use to apply operations to your data during prior it being persisted or hydrated.

      One use case for a transformer is to handle data that can't be parsed to a JSON string. For example a `Map` or `Set`. To handle these data types you could utilise a transformer that converts the `Map`/`Set` to/from an `Array` or `Object`.

      Transformers are applied left to right during data persistence, and are applied right to left during data rehydration.

      [`redux-persist`](https://github.com/rt2zz/redux-persist) already has a robust set of [transformer packages](https://github.com/rt2zz/redux-persist#transforms) that have been built for it. These can be used here.

    - `storage` (string | Object, *optional*)

      The storage engine to be used. It defaults to `sessionStorage`. The following values are supported:

      - `'sessionStorage'`

        Use the browser's sessionStorage as the persistence layer.

        i.e. data is available for rehydration for a single browser session

      - `'localStorage'`

        Use the browser's localStorage as the persistence layer.

        i.e. data is available across browser sessions

      - Custom engine

        A custom storage engine.

        [`redux-persist`](https://github.com/rt2zz/redux-persist) already has a robust set of [storage engine packages](https://github.com/rt2zz/redux-persist#storage-engines) that have been built for it. These can be used here.

## Example

In the simple example below we will make our entire store persist.

```javascript
import { persist } from 'easy-peasy';
//         👆 import the helper

// Then wrap the root model with the helper
//            👇
let model = persist({
  counter: 0,
  todos: [],
  increment: (state) => {
    state.counter += 1;
  }
});
```

## Example with configuration

The below examples demonstrates a configured persistence instance in which we will only persist the `counter`.

```javascript
const model = persist(
  {
    counter: 0,
    todos: [],
    increment: (state) => {
      state.counter += 1;
    }
  },
  // 👇 configuration
  {
    whitelist: ['counter'],
  }
);
```

## Nested persistence

The below example demonstrates that you can utilise the `persist` utility at any depth of your model.

```javascript
const model = {
  todos: {
    todos: [],
    addTodo: (state, payload) => {
      state.todos.push(payload);
    }
  },
  session: persist({
    user: null,
    login: thunk(/* ... */)
  })
}
```

There is no restriction on how many `persist` instances you can have on your model. Provide as many configurations as you require and the respective models will have their state persisted and rehydrated accordingly.

## Working with asynchronous storage engines

When utilising an asynchronous storage engine (i.e. their storage APIs return `Promise`s) you may want to wait for their asynchronous operations to complete prior to rendering your application. This would help to avoid a flash of content change, where your site would initially render with the default store state, and then suddenly rerender with the rehydrated state after it is resolved from the asynchronous storage engine.

There are two strategies that you can employ to deal with this case.

**Option 1: Wait for the rehydration to complete prior to rendering your application**

The store instance contains an API allowing to access a `Promise` that represents the resolution of the asynchronous storage state being resolved during state rehydration.  You can wait on this `Promise` prior to rendering your application, which would ensure that your application is rendered with the expected rehydrated state.

```javascript
const store = createStore(persist(model, { storage: asyncStorageEngine });

store.persist.resolveRehydration().then(() => {
  ReactDOM.render(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>,
    document.getElementById('app')
  );
});
```

**Option 2: Eagerly render your application and utilise the `useStoreRehydrated` hook**

You can alternatively render your application immediately, i.e. not wait for the async rehydration to resolve.

To improve your user's experience you can utilise the [`useStoreRehydrated`](/docs/api/use-store-rehydrated.html) hook. This hook returns a boolean flag indicating when the rehydration has completed.

```javascript
import { useStoreRehydrated } from 'easy-peasy';

const store = createStore(persist(model, { storage: asyncStorageEngine });

function App() {
  const rehydrated = useStoreRehydrated();
  return (
    <div>
      <Header />
      {rehydrated ? <Main /> : <div>Loading...</div>}
      <Footer />
    </div>
  )
}

ReactDOM.render(
  <StoreProvider store={store}>
    <App />
  </StoreProvider>,
  document.getElementById('app')
);
```

In the example above, the `<Main />` content will not render until our store has been successfully updated with the rehydration state.

## Persisting multiple stores

If you utilise multiple stores, each with their own persistence configuration, you will need to ensure that each store is configured to have a unique name. The store name for each instance of your stores will be used within the persistence layer cache keys.

## Creating a custom storage engine

A storage engine is an object structure that needs to implement the following interface:

  - `getItem(key) => any | Promise<any> | void`

    This function will receive the key, i.e. the key of the model item being rehydrated, and should return the associated data from the persistence if it exists. It can alternatively return a `Promise` that resolves the data, or `undefined` if no persisted data was found.

  - `setItem(key, data) => void | Promise<void>`

    This function will receive the key, i.e. the key of the model data being persisted, as well as the associated data value. It should then store the respective data. It can alternatively return a `Promise` which indicates when the item has been successfully persisted.

  - `removeItem(key) => void | Promise<void>`

    This function will receive the key, i.e. the key of the model item that exists in the persistence, and should remove any data that is currently being stored within the persistence. It can alternatively return a `Promise` which indicates when the item has been successfully removed from the persistence.

## Creating a custom transformer

Easy Peasy outputs a [`createTransformer`](/docs/api/create-transformer.html) function, which has been directly copied from [`redux-persist`](https://github.com/rt2zz/redux-persist) in order to maximum compatiblity with it's ecosystem.
