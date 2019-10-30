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

      The strategy that should be employed when rehydrating your store. The following values are supported:

      - `'merge'` (*default*)

        The data from the persistence will be merged over the initial model data.

      - `'overwrite'`

        The data from teh persistence will overwrite the model data completely.

      - `'mergeDeep'` 

        The data from the persistence will be merged deeply, recursing through all _object_ structures and merging.
    
    - `persistMiddleware` (Array<Function>, *optional*)

      These are transformer functions that will be applied to each data item prior to it being persisted. They will be executed in a left to right fashion, with each transformation becoming the data input to the next transform function.

      The transform function receives the following arguments and should return the transformed data:

      - `data` (any)

        The data to be persisted.

      - `key` (string)

        The key against which the data originates on the model being persisted.

    - `rehydrateMiddleware` (Array<Function>, *optional*)

      These are transformer functions that will be applied to each data item prior to it being rehydrated from the persistence. They will be executed in a left to right fashion, with each transformation becoming the data input to the next transform function.

      The transform function receives the following arguments and should return the transformed data:

      - `data` (any)

        The data being rehydrated.

      - `key` (string)

        The key against which the data will be applied on the model being rehydrated.

    - `storage` (string | Object, *optional*)

      The storage engine to be used. It defaults to localStorage. The following values are supported:

      - `'localStorage'`

        Use the browser's localStorage as the persistence layer.
      
      - `'sessionStorage'`

        Use the browser's sessionStorage as the persistence layer.

      - Custom engine

        You can provide a custom storage engine. A storage engine is an object structure that needs to implement the following properties:

        - `getItem(key) => any | Promise<any> | void`

          This function will receive the key, i.e. the key of the model item being rehydrated, and should return the associated data from the persistence if it exists. It can alternatively return a `Promise` that resolves the data, or `undefined` if no persisted data was found.

        - `setItem(key, data) => void | Promise<void>`

          This function will receive the key, i.e. the key of the model data being persisted, as well as the associated data value. It should then store the respective data. It can alternatively return a `Promise` which indicates when the item has been successfully persisted.

        - `removeItem(key) => void | Promise<void>`

          This function will receive the key, i.e. the key of the model item that exists in the persistence, and should remove any data that is currently being stored within the persistence. It can alternatively return a `Promise` which indicates when the item has been successfully removed from the persistence.

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

## Asynchronous Storage Engines

When utilising an asynchronous storage engine (i.e. they return `Promise`s) you may want to wait for their asynchronous operations to complete during the rehydration step.

