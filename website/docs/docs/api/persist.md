# persist

This helper allows you to persist your store state, and subsequently rehydrate
the store state when the store is recreated (e.g. on page refresh, new browser
tab, etc).

By default it uses the browser's
[`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage),
however, you can configure it to use
[`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage),
or provide a custom storage engine.

- [Tutorial](#tutorial)
  - [Configuring your store to persist](#configuring-your-store-to-persist)
  - [Rehydrating your store](#rehydrating-your-store)
- [API](#api)
- [Merge Strategies](#merge-strategies)
  - [mergeDeep](#mergedeep)
  - [shallowMerge](#shallowmerge)
  - [overwrite](#overwrite)
- [Merge conflict resolution](#merge-conflict-resolution)
  - [Conflict resolution](#conflict-resolution)
  - [Ensuring persistence completes prior to application unmount](#ensuring-persistence-completes-prior-to-application-unmount)
- [Deleting persisted data](#deleting-persisted-data)
- [Rehydrating dynamic models](#rehydrating-dynamic-models)
- [Persisting multiple stores](#persisting-multiple-stores)
- [Custom storage engines](#custom-storage-engines)
- [Custom data transformers](#custom-data-transformers)
- [Frequently Asked Questions](#frequently-asked-questions)
  - [How do I manage changes to my store model?](#how-do-i-manage-changes-to-my-store-model)

## Tutorial

This section will provide an in-depth walkthrough to persisting and rehydrating
your store's state.

### Configuring your store to persist

When choosing to persist your state you firstly need to decide on the scope of
your persistence - i.e. how much of your state do you wish to be persisted. You
can persist the whole state, a partial slice of your state, or multiple slices
of your state.

In the example below we will persist our entire state by wrapping our root model
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

You can alternatively target specific parts of your state by wrapping the
desired nested models.

```javascript
const store = createStore(
  products: productsModel,
  basket: persist(basketModel),
  session: persist(sessionModel)
);
```

Or you can utilise the configuration to explicitly select which keys of a model
will be persisted.

```javascript
const store = createStore(
  persist(
    {
      products: productsModel,
      basket: basketModel,
      session: sessionModel,
    },
    {
      allow: ['basket', 'session'],
    },
  ),
);
```

Every time a state change occurs the persistence process will be queued to save
the state to the storage
([`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
by default).

### Rehydrating your store

Every time your store is created, any data that has been persisted will be used
to rehydrate your state accordingly. **_This process is asynchronous_**,
therefore best practice to ensure that the rehydration has completed prior to
rendering the components within your application that will access the rehydrated
state.

To aid with this we expose a
[`useStoreRehydrated`](/docs/api/use-store-rehydrated.html) hook. This hook will
return `true` when the rehydration process has completed, otherwise it will
return `false`.

Using this hook you could for example show a loading indicator in place of the
components that will depend on the rehydrated state.

This allows for a partial application render, providing the user with some
perceived performance, as you could render the skeleton of the application in
the interim.

```javascript
import { useStoreRehydrated } from 'easy-peasy';

const store = createStore(persist(model));

function App() {
  const isRehydrated = useStoreRehydrated();
  return (
    <div>
      <Header />
      {isRehydrated ? <Main /> : <div>Loading...</div>}
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

Alternatively you could create a simple component to wrap your application and
ensure that state rehydration is completed prior to rendering the entire app.

```javascript
import { useStoreRehydrated } from 'easy-peasy';

function WaitForStateRehydration({ children }) {
  const isRehydrated = useStoreRehydrated();
  return isRehydrated ? children : null;
}

ReactDOM.render(
  <StoreProvider store={store}>
    <WaitForStateRehydration>
      <App />
    </WaitForStateRehydration>
  </StoreProvider>,
  document.getElementById('app'),
);
```

Ultimately, as shown, the `useStoreRehydrated` hook provides a lot of
flexibility.

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
      allow: ['counter'], // We will only persist the "counter" state
    },
  );
  ```

  The configuration object supports the following properties:

  - `allow` (Array&lt;string&gt;, _optional_)

    A list of keys, representing the parts of the model that should be
    persisted. Any part of the model that is not represented in this list will
    not be persisted.

  - `deny` (Array&lt;string&gt;, _optional_)

    A list of keys, representing the parts of the model that should not be
    persisted. Any part of the model that is not represented in this list will
    be persisted.

  - `mergeStrategy` (string, _optional_, default=mergeDeep)

    The strategy that should be employed when rehydrating the persisted state
    over your store's initial state.

    Please see the [docs](#merge-strategies) below for a full insight and
    understanding of the various options and their respective implications.

  - `strict` (boolean, _optional_, default=false)

    This value is utilized during the rehydration process.

    If any conflicts are found when comparing the persisted state against the
    store model then the rehydration will be entirely cancelled and the initial
    store state will be used.

  - `transformers` (Array&lt;Transformer&gt;, _optional_)

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

## Merge Strategies

The following values are supported:

### mergeDeep

This is the _default_ strategy.

The data from the persistence will be merged deeply, recursing through all
_object_ structures and merging.

i.e.

Given a store with the following state defined within the model;

```json
{
  "animal": "dolphin",
  "address": {
    "city": "london",
    "post code": "e3 1pq"
  }
}
```

And the following persisted state;

```json
{
  "fruit": "apple",
  "address": {
    "city": "cape town"
  }
}
```

The resulting state will be;

```diff
{
   "animal": "dolphin",
+  "fruit": "apple",
   "address": {
-    "city": "london",
+    "city": "cape town",
     "post code": "e3 1pq"
   }
}
```

Only _plain objects_ will be recursed and merged; no other types such as Arrays,
Maps, Sets, Classes etc will be considered when traversing through the model.

### shallowMerge

The data from the persistence will be _shallowly_ merged with the initial state
represented by your store's model.

i.e.

Given a store with the following definition;

```javascript
import { persist, createStore } from 'easy-peasy';

const store = createStore(
  persist(
    {
      animal: 'dolphin',
      address: {
        city: 'london',
        postCode: 'e3 1pq',
      },
    },
    {
      mergeStrategy: 'shallowMerge',
    },
  ),
);
```

And the following persisted state;

```json
{
  "fruit": "apple",
  "address": {
    "city": "cape town"
  }
}
```

The resulting state will be;

```diff
{
   "animal": "dolphin"
+  "fruit": "apple",
   "address": {
-    "city": "london",
-    "postCode": "e3 1pq"
+    "city": "cape town"
   },
}
```

Pay close attention to above.

The `address.postCode` property from our store's model didn't survive the state
rehydration process.

This is because the `shallowMerge` strategy only compares the root properties
against the model that it was bound. The `postCode` proper is nested within the
`address`. However, as we are performing a shallow merge we will use the
`address` value from the persisted state, overriding the `address` value from
our store's model, and losing the `address.postCode` value that was defined
within the model.

This behaviour may be okay for your use-case, however, if your store model
evolves with updates to nested properties then it is entirely possible that
persisted state may not match the required structure based on the evolved store
model. This could cause errors within your application if your components
assumed the existing of a particular state structure.

We therefore suggest using this strategy _very_ carefully, and encourage you to
use the `mergeDeep` strategy instead.

The `shallowMerge` strategy is perhaps more useful if you would like to define
your persistence on the "leaf" models of your store's model, like so;

```javascript
import { persist, createStore } from 'easy-peasy';

const model = {
  address: persist(
    {
      city: 'london',
      postCode: 'e3 1pq',
    },
    { mergeStrategy: 'shallowMerge' },
  ),
  todos: persist(
    {
      items: [],
    },
    { mergeStrategy: 'shallowMerge' },
  ),
};
```

This form is far more robust and gives you much more flexibility and control
over your persistence.

### overwrite

Utilizing this strategy will cause the state from your store model to be
_completely_ overwritten by the persisted state.

i.e.

Given a store with the following definition;

```javascript
import { persist, createStore } from 'easy-peasy';

const store = createStore(
  persist(
    {
      fruit: 'pear',
    },
    { mergeStrategy: 'overwrite' },
  ),
);
```

And the following persisted state;

```json
{
  "city": "cape town"
}
```

The resulting state will be:

```diff
{
-  "fruit": "pear",
+  "city": "cape town"
}
```

This is perhaps the most risky strategy as we intentionally replace our stores
initial state with that of the persisted state. If the store model has diverged
you could open yourself up to errors/bugs. Please take extra care and
consideration when using this strategy.

## Merge conflict resolution

When utilizing the `mergeDeep` (the default) or `merge` strategies it can be
helpful to have some insight into how the rehydration algorithm works.
Especially in the case that you have been making updates to your store's model.

If a user of your application has persisted state

### Conflict resolution

<!-- ## `mergeDeep` traversal -->

### Ensuring persistence completes prior to application unmount

**_Persistence operations are asynchronous_**, therefore it is possible that a
state change might not be persisted before your application unmounts.

It is important to consider this when state changes occur prior to events that
may cause your application to unmount, for e.g. a page refresh, or the user
navigating away from your site. An event such as this may result in queued
persistence operations not being executed, resulting in a persisted state that
is stale.

It is therefore good practice to manage events that could cause this behaviour,
ensuring that any outstanding persist operations have completed.

Your [store instances](/docs/api/store.html) contain an API which allows you to
complete the queued persist operations, specifically the `store.persist.flush()`
API.

When this API is executed any outstanding persist operations will be immediately
performed, with a `Promise` being returned. The resolution of the returned
`Promise` indicates that the persist has completed, after which you can safely
continue to unmount the application.

Below are some example utility functions that follow this strategy.

```javascript
import store from './store';

const refreshPage = async () => {
  // Firstly ensure that any outstanding persist operations are complete.
  // Note that this is an asynchronous operation so we will await on it.
  await store.persist.flush();

  // we can now safely reload the page
  window.document.reload();
};

const redirectTo = async (href) => {
  // Firstly ensure that any outstanding persist operations are complete.
  // Note that this is an asynchronous operation so we will await on it.
  await store.persist.flush();

  // We can now safely redirect the browser
  window.location.href = href;
};
```

## Deleting persisted data

Should you wish to remove all the data that has been persisted for your model
you can utilise the [store instance's API](/docs/api/store.html) to do so.

```javascript
const store = createStore(model);

if (userIsLoggingOut) {
  store.persist.clear().then(() => {
    console.log('Store has been cleared');
  });
}
```

Note that a `Promise` was returned, which when resolved indicates that the data
has been removed from your persistence layers.

## Rehydrating dynamic models

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

## Persisting multiple stores

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

## Custom storage engines

You can create a custom storage engine by defining an object that satisfies the
following interface:

- `getItem(key) => any | Promise<any> | void`

  This function will receive the key, i.e. the key of the model property item
  being rehydrated, and should return the associated data from the persistence
  if it exists. It can alternatively return a `Promise` that resolves the data,
  or `undefined` if no persisted data was found.

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

## Custom data transformers

Transforms allow you to customize the state object that gets persisted and
rehydrated. They allow you to for instance convert store data from a complex
object, such as a `Map`, into a structure that is JSON serialisable (and back
again).

Easy Peasy outputs a [`createTransformer`](/docs/api/create-transformer.html)
function, which has been directly copied from
[`redux-persist`](https://github.com/rt2zz/redux-persist) in order to maximum
compatiblity with it's ecosystem.

## Frequently Asked Questions

Below are some of the common questions we receive about this API.

### How do I manage changes to my store model?

This can be a real problem. It's entirely possible that you perform a
significant update to your store model which doesn't line up with what a user
has previously persisted. The result can be a fragile user experience in which
errors occur due to things like attempting to access state which doesn't exist,
or which has changed in structure.

By default the persist API utilizes the `mergeDeep` strategy, which attempts to
perform an optimistic merge of the persisted state against the initial state
represented by the store model.

TODO
