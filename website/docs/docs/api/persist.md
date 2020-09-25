# persist

This helper allows you to persist your store state, and subsequently rehydrate
the store state when the store is recreated (e.g. on page refresh, new browser
tab, etc).

By default it uses the browser's
[`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage).

- [Tutorial](#tutorial)
  - [Configuring your store to persist](#configuring-your-store-to-persist)
  - [Controlling the rate of persistence](#controlling-the-rate-of-persistence)
  - [Ensuring latest store state has completed persistence](#ensuring-latest-store-state-has-completed-persistence)
  - [Rehydrating your store](#rehydrating-your-store)
  - [Deleting persisted data](#deleting-persisted-data)
- [Advanced Tutorial](#advanced-tutorial)
  - [Handling dynamic models](#handling-dynamic-models)
  - [Persisting multiple stores](#persisting-multiple-stores)
  - [Storage Engines](#storage-engines)
    - [Custom storage engines](#custom-storage-engines)
    - [Custom data transformers](#custom-data-transformers)
- [API](#api)

## Tutorial

This section will provide an in-depth introduction to configuring and using the
`persist` helper within your application.

### Configuring your store to persist

When utilising the `persist` helper you firstly need to decide on the scope of
your persistence; i.e. how much of your store model do you wish to be persisted.
You can choose to persist the whole store, a partial slice of your store, or
multiple slices of your store.

In the example below we will persist our entire store by wrapping our root model
with the `persist` helper.

```javascript
import { persist } from 'easy-peasy';

const store = createStore(
  persist({
    count: 1,
    inc: action((state) => {
      state.count += 1;
    }),
  }),
);
```

You can also target specific parts of your model that you would like to persist
by wrapping the desired models with the `persist` helper.

```javascript
const store = createStore(
  products: productsModel,
  basket: persist(basketModel),
  session: persist(sessionModel)
);
```

Alternatively, you can utilise the `persist` configuration to explicitly select
which keys of a model will be persisted.

```javascript
const store = createStore(
  persist(
    {
      products: productsModel,
      basket: basketModel,
      session: sessionModel,
    },
    {
      deny: ['products'],
    },
  ),
);
```

Every time your state changes the changes will be persisted to the configured
storage engine.

### Controlling the rate of persistence

Persistence can become an IO expensive operation, especially with stores that
are large.

By default we [debounce](https://davidwalsh.name/javascript-debounce-function)
persist operations so that a persist operation can be executed a maximum of once
every second. This can help avoid IO thrashing where you may have a store that
is updated frequently, and in quick session.

Currently the persist operations are debounced, ensuring that a maximum of 1
write operation is executed every second.

Depending on your own implementation you may find this rate limit is either too
small or too high. You can configure the debounce rate via the `persist`
configuration.

```javascript
const storeModel = persist(model, {
  rateLimit: 1000, // in milliseconds
});
```

### Ensuring latest store state has completed persistence

As the persistence operations are debounced there may be a delay between when a
state change occurs and when it is persisted.

It is important to consider this when state changes occur prior to events that
may cause your application to unmount, for e.g. a page refresh, or the user
navigating away from your site. An event such as this may result in the queued
persistence operations not being executed, resulting in a persisted state that
is stale.

It is therefore good practice to respond to such events, ensuring that any
outstanding persist operations have completed.

Your [store instances](/docs/api/store.html) contain an API which allows you to
complete the outstanding persist operations, specifically the
`store.persist.flush()` API. When this API is executed any outstanding persist
operations will be immediately executed, with a `Promise` being returned. The
resolution of the returned `Promise` indicates that the the persist operations
have completed, after which you can allow original event to continue.

Below is an example of how you might introduce some guarding logic that makes
use of this API.

```javascript
import store from './store';

const refreshPage = async () => {
  // Firstly ensure that any outstanding persist operations are complete.
  // Note that this is an asynchronous operation so we will await on it.
  await store.persist.flush();

  // we can now safely reload the page
  window.document.reload();
};
```

### Rehydrating your store

Every time your store is created, any data that has been persisted will be used
to rehydrate your state accordingly. It is best practice to ensure that the data
rehydration has completed prior to rendering the components within your
application that will operate against the rehydrated state.

There are two strategies that you can employ to ensure data rehydration has
completed.

**Strategy 1: Wait for the rehydration to complete prior to rendering the entire
application**

The [store instances](/docs/api/store.html) contains an API allowing to gain a
handle on when the rehydration process has completed, specifically
`store.persist.resolveRehydration()`. Wehen you execute this API you will
receive back a `Promise`. The `Promise` will resolve when the data rehydration
has completed.

Therefore you can wait on this `Promise` prior to rendering your application,
which would ensure that your application is rendered with the expected
rehydrated state.

```javascript
const store = createStore(persist(model));

store.persist.resolveRehydration().then(() => {
  ReactDOM.render(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>,
    document.getElementById('app'),
  );
});
```

**Strategy 2: Eagerly render your application and utilise the
`useStoreRehydrated` hook**

You can alternatively partially render your application and utilise the
[`useStoreRehydrated`](/docs/api/use-store-rehydrated.html) hook to wait for
rehydration to complete prior to rendering the parts of your application that
depend on the rehydrated state.

```javascript
import { useStoreRehydrated } from 'easy-peasy';

const store = createStore(persist(model));

function App() {
  const rehydrated = useStoreRehydrated();
  return (
    <div>
      <Header />
      {rehydrated ? <Main /> : <div>Loading...</div>}
      <Footer />
    </div>
  );
}

ReactDOM.render(
  <StoreProvider store={store}>
    <App />
  </StoreProvider>,
  document.getElementById('app'),
);
```

In the example above, the `<Main />` content will not render until our store has
been successfully updated with the rehydration state.

### Deleting persisted data

Should you wish to remove all the data that has been persisted for your model
you can utilise the [Store instance](/docs/api/store.html) API to do so.

```javascript
const store = createStore(model);

if (someCondition) {
  store.persist.clear().then(() => {
    console.log('Store has been cleared');
  });
}
```

Note that a `Promise` was returned, which when resolved indicates that the data
has been removed from your persistence layers.

## Advanced Tutorial

The below sections will cover more advanced use cases.

### Handling dynamic models

The `persist` API will work with dynamic models, i.e. models that were added to
the store via the [`store.addModel`](/docs/api/store.html) API after the store
was created.

Every time a dynamic model is added to your store Easy Peasy will attempt to
rehydrate any persisted state for that model.

```typescript
store.addModel('products', productsModel);
```

To ensure that the rehydration has completed you can use the
`resolveRehydration` helper that is returned by the
[`store.addModel`](/docs/api/store.html) API.

```typescript
const { resolveRehydration } = store.addModel('products', productsModel);
//            👆
// Deconstruct the returned object to get a handle on resolveRehydration

// 👇 execute the helper and wait on the returned promise
resolveRehydration().then(() => {
  console.log('Rehydration is complete');
});
```

### Persisting multiple stores

If you utilise multiple stores, each with their own persistence configuration,
you will need to ensure that each store is configured to have a unique name. The
store name for each instance of your stores is used within the persistence cache
keys created by Easy Peasy.

```javascript
const storeOne = createStore(persist(model), {
  name: 'StoreOne', // 👈
});

const storeTwo = createStore(persist(model), {
  name: 'StoreTwo', // 👈
});
```

### Storage Engines

The below sections deal with the advanced topic of creating and using custom
storage engines and data serializers.

#### Custom storage engines

You can create a custom storage engine by defining an object that satisfies the
following interface:

- `getItem(key) => any | Promise<any> | void`

  This function will receive the key, i.e. the key of the model item being
  rehydrated, and should return the associated data from the persistence if it
  exists. It can alternatively return a `Promise` that resolves the data, or
  `undefined` if no persisted data was found.

- `setItem(key, data) => void | Promise<void>`

  This function will receive the key, i.e. the key of the model data being
  persisted, as well as the associated data value. It should then store the
  respective data. It can alternatively return a `Promise` which indicates when
  the item has been successfully persisted.

- `removeItem(key) => void | Promise<void>`

  This function will receive the key, i.e. the key of the model item that exists
  in the persistence, and should remove any data that is currently being stored
  within the persistence. It can alternatively return a `Promise` which
  indicates when the item has been successfully removed from the persistence.

Once defined you can reference your custom storage engine within the
configuration for your `persist` instance.

```javascript
import myCustomStorageEngine from './my-custom-storage-engine';

const storeModel = persist(model, {
  storage: myCustomStorageEngine,
});
```

#### Custom data transformers

Transforms allow you to customize the state object that gets persisted and
rehydrated. They allow you to for instance convert store data from a complex
object, such as a `Map`, into a structure that is JSON serialisable (and back
again).

Easy Peasy outputs a [`createTransformer`](/docs/api/create-transformer.html)
function, which has been directly copied from
[`redux-persist`](https://github.com/rt2zz/redux-persist) in order to maximum
compatiblity with it's ecosystem.

## API

Below is the API of the `persist` helper.

Please be aware that [Store instances](/docs/api/store.html) contain additional
APIs relating to persistence; for example - allowing you to ensure all
outstanding persist operations complete prior to navigating away from your
application. We highly recommend you read the examples in the docs below and
familiarize yourself with the API of [Store instances](/docs/api/store.html).

- `model` (Object, _required_)

  The model that you wish to apply persistence to.

  > You can surround your entire model, or a nested model. You can even have
  > multiple `persist` configurations scattered throughout your store's model.
  > Feel free to use the API on the parts of your state feel most appropriate
  > for persistence/rehydration.

- `config` (Object, _optional_)

  You can provide a second parameter to your `persist` instances, which
  represents a configuration for the instance.

  ```javascript
  const model = persist(
    {
      counter: 0,
      todos: [],
      increment: (state) => {
        state.counter += 1;
      },
    },
    // 👇 configuration
    {
      whitelist: ['counter'], // We will only persist the "counter" state
    },
  );
  ```

  The configuration object supports the following properties:

  - `blacklist` (Array<string>, _optional_)

    A list of keys, representing the parts of the model that should not be
    persisted. Any part of the model that is not represented in this list will
    be persisted.

  - `whitelist` (Array<string>, _optional_)

    A list of keys, representing the parts of the model that should be
    persisted. Any part of the model that is not represented in this list will
    not be persisted.

  - `mergeStrategy` (string, _optional_)

    The strategy that should be employed when rehydrating the persisted state
    over your store's initial state.

    The following values are supported:

    - `'merge'` (_default_)

      The data from the persistence will be _shallow_ merged with the initial
      state represented by your store's model.

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

      The data from the persistence will _completely_ overwrite the initial
      state represented by your store's model.

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

      The data from the persistence will be merged deeply, recursing through all
      _object_ structures and merging.

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

      > **Note:** Only _plain objects_ will be recursed and merged; no other
      > types such as Arrays, Maps, Sets, Classes etc.

  - `transformers` (Array<Transformer>, _optional_)

    Transformers are use to apply operations to your data during prior it being
    persisted or hydrated.

    One use case for a transformer is to handle data that can't be parsed to a
    JSON string. For example a `Map` or `Set`. To handle these data types you
    could utilise a transformer that converts the `Map`/`Set` to/from an `Array`
    or `Object`.

    Transformers are applied left to right during data persistence, and are
    applied right to left during data rehydration.

    [`redux-persist`](https://github.com/rt2zz/redux-persist) already has a
    robust set of
    [transformer packages](https://github.com/rt2zz/redux-persist#transforms)
    that have been built for it. These can be used here.

  - `storage` (string | Object, _optional_)

    The storage engine to be used. It defaults to `sessionStorage`. The
    following values are supported:

    - `'sessionStorage'`

      Use the browser's sessionStorage as the persistence layer.

      i.e. data is available for rehydration for a single browser session

    - `'localStorage'`

      Use the browser's localStorage as the persistence layer.

      i.e. data is available across browser sessions

    - Custom engine

      A custom storage engine.

      [`redux-persist`](https://github.com/rt2zz/redux-persist) already has a
      robust set of
      [storage engine packages](https://github.com/rt2zz/redux-persist#storage-engines)
      that have been built for it. These can be used here.
