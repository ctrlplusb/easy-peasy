# persist

This helper allows you to persist your store state, allowing it to be rehydrated when your application is remounted (e.g. on page refresh or a new browser session).

It is _heavily_ inspired by [`redux-persist`](https://github.com/rt2zz/redux-persist), with the intention of exposing APIs that are mostly compatible with that of [`redux-persist`](https://github.com/rt2zz/redux-persist). This will allow you to reuse packages such as the storage engines or transformers that currently exist for [`redux-persist`](https://github.com/rt2zz/redux-persist).

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

Every time state changes in your model, it will be persisted via the selected storage engine (the browser's localStorage by default). 

When your application is mounted again, e.g. on a page refresh, the data will be rehydrated from the storage into your store during the store's creation.

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

  - `model` (Object, *required*)

    The model that you wish to apply persistence to. You can surround your entire model, or a nested model. You can even have multiple `persist` configurations across your model.

  - `config` (Object, *optional*)

    The persistence configuration. It supports the following properties:

    - `blacklist` (Array<string>, *optional*)

      A list of keys, representing the parts of the model that should not be persisted. Any part of the model that is not represented in this list will be persisted.

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

      The storage engine to be used. It defaults to localStorage. The following values are supported:

      - `'localStorage'`

        Use the browser's localStorage as the persistence layer.
      
      - `'sessionStorage'`

        Use the browser's sessionStorage as the persistence layer.

      - Custom engine

        A custom storage engine. 

        [`redux-persist`](https://github.com/rt2zz/redux-persist) already has a robust set of [storage engine packages](https://github.com/rt2zz/redux-persist#storage-engines) that have been built for it. These can be used here.

    - `whitelist` (Array<string>, *optional*)

      A list of keys, representing the parts of the model that should be persisted. Any part of the model that is not represented in this list will not be persisted.

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

**Option 2: Eagerly render your application and utilise the `RehydrateBoundary` component**

You can alternatively render your application immediately, i.e. not wait for the async rehydration to resolve. 

To improve your user's experience you can utilise the [`RehydrateBoundary`](/docs/api/rehydrate-boundary.html) component. Any components surrounded by a `RehydrateBoundary` will not be rendered until the asynchronous state rehydration has completed. 

```javascript
import { RehydrateBoundary } from 'easy-peasy';

const store = createStore(persist(model, { storage: asyncStorageEngine });

ReactDOM.render(
  <StoreProvider store={store}>
    <div>
      <Header />
      <RehydrateBoundary>
        <Main />
      </RehydrateBoundary>
      <Footer />
    </div>
  </StoreProvider>,
  document.getElementById('app')
);
```

In the example above, the `<Main />` content will not render until our store has been successfully updated with the rehydration state.

## Creating a custom storage engine

A storage engine is an object structure that needs to implement the following properties:

  - `getItem(key) => any | Promise<any> | void`

    This function will receive the key, i.e. the key of the model item being rehydrated, and should return the associated data from the persistence if it exists. It can alternatively return a `Promise` that resolves the data, or `undefined` if no persisted data was found.

  - `setItem(key, data) => void | Promise<void>`

    This function will receive the key, i.e. the key of the model data being persisted, as well as the associated data value. It should then store the respective data. It can alternatively return a `Promise` which indicates when the item has been successfully persisted.

  - `removeItem(key) => void | Promise<void>`

    This function will receive the key, i.e. the key of the model item that exists in the persistence, and should remove any data that is currently being stored within the persistence. It can alternatively return a `Promise` which indicates when the item has been successfully removed from the persistence.

## Creating a custom transformer

Easy Peasy outputs a `createTransformer` function, which has been directly copied from 

The transform function receives the following arguments and should return the transformed data:

- `data` (any)

  The data to be persisted.

- `key` (string)

  The key of which the data originates from the model being persisted.