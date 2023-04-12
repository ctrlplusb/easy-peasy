# persist

This helper allows you to persist your store state, perform migrations, and
subsequently rehydrate the store state when the store is recreated (e.g. on page
refresh, new browser tab, etc).

By default it uses the browser's
[`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage),
however, you can configure it to use
[`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage),
or provide a custom storage engine.

- [API](#api)
  - [Arguments](#arguments)
  - [Related APIs](#related-apis)
- [Tutorial](#tutorial)
  - [Configuring your store to persist](#configuring-your-store-to-persist)
  - [Rehydrating your store](#rehydrating-your-store)
  - [Managing model updates](#managing-model-updates)
  - [Migrations](#migrations)
  - [Forced updates via `version`](#forced-updates-via-version)
- [Advanced Tutorial](#advanced-tutorial)
  - [Merge Strategies](#merge-strategies)
    - [mergeDeep](#mergedeep)
    - [mergeShallow](#mergeshallow)
    - [overwrite](#overwrite)
  - [Ensuring persistence completes prior to application unmount](#ensuring-persistence-completes-prior-to-application-unmount)
  - [Deleting persisted data](#deleting-persisted-data)
  - [Rehydrating dynamic models](#rehydrating-dynamic-models)
  - [Persisting multiple stores](#persisting-multiple-stores)
  - [Custom storage engines](#custom-storage-engines)
  - [Custom data transformers](#custom-data-transformers)

## API

Below is the API of the `persist` helper function.

### Arguments

- `model` (Object, _required_)

  The model that you wish to apply persistence to.

- `config` (Object, _optional_)

  You can provide a second parameter to your `persist` instances, which
  represents a configuration for the instance. The configuration object supports
  the following properties:

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
    over your store's initial state. It can be one of the following values:

    - `mergeDeep`
    - `mergeShallow`
    - `overwrite`

    Please see the [docs](#merge-strategies) below for a full insight and
    understanding of the various options and their respective implications.

  - `migrations` (Object, _optional_)

    This config is used to transform persisted store state from one representation to another. This object is keyed by version numbers, with migration functions attached to each version. A `migrationVersion` is also required for this object, to specify which version to target.

    ```ts
    persist(
      {...},
      {
        migrations: {
          migrationVersion: 2,
          1: (state) => { ... },
          2: (state) => { ... },
        },
      }
    );
    ```

  - `transformers` (Array&lt;Transformer&gt;, _optional_)

    Transformers are used to apply operations to your data prior to it being
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

### Related APIs

Please be aware that [Store instances](/docs/api/store.html) contain additional
APIs relating to persistence.

For example the `store.persist.flush()` API will immediately execute any queued
persist operations. This can be useful in the context of actions that cause your
application to unmount, like the user navigating away from your application.

See the [Store](/docs/api/store.html) docs for more information.

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

> **Note:** the persisting process is an asynchronous one. Internally we manage
> a queue and make sure that multiple persistence operations are not fired off
> concurrently.

### Rehydrating your store

Every time your store is created, we will check for persisted data. If any is
found we will use it to rehydrate your store accordingly. **_This process is
asynchronous._** Therefore it is best practice to ensure that the rehydration
has completed prior to rendering the components within your application that
will access the rehydrated state.

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

Alternatively you could create a simple component to wrap your entire
application, ensuring that state rehydration has completed prior to rendering
it.

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

### Managing model updates

It's entirely reasonable that your store model will evolve over time. However,
there is an inherent risk with this when utilizing the persist API.

If your application has previously been deployed to production then users may
have persisted state based on a previous version of your store model. The user's
persisted state may not align with that of your new store model, which could
result in errors when a component tries to consume/update the store.

Easy Peasy does its best to try and minimize / alleviate this risk by providing
two ways for managing updates: migrations and store version updates.

### Migrations

[Similar to `redux-persist`](https://github.com/rt2zz/redux-persist#migrations),
the persist API provides a mechanism for migrating persisted state across store
updates via the `migrations` configuration object.

**Example**

Imagine a store model that has a property called `session`, and a recent
requirements change necessitates that `session` be renamed to `userSession` for
specificity reasons. Without a migration, if `session` was previously deployed
to users and persisted, when the `userSession` change is released their
application will break due to the mismatch between `session` and `userSession`
as retrieved from local storage.

In order to mitigate we can add a state migration:

```ts
persist(
  {
    userSession: true,
  },
  {
    migrations: {
      migrationVersion: 1, // 👈 set the latest migration version

      1: (state) => {
        state.userSession = state.session; // 👈 update new prop with old value from local storage
        delete state.session; // and then delete, as it is no longer used
      },
    },
  },
);
```

If this property changes in the future, we can add another migration:

```ts
persist(
  {
    domainSession: true, // 👈 model has changed
  },
  {
    migrations: {
      migrationVersion: 2, // 👈 update to the latest version

      1: (state) => {
        state.userSession = state.session;
        delete state.session;
      },

      2: (state) => {
        state.domainSession = state.userSession;
        delete state.userSession;
      },
    },
  },
);
```

### Forced updates via `version`

If migrations are insufficient (which can often be the case after a major state
refactor has taken place), the persist API also provides a means to "force
update" the store via `version`.

By default the persist API utilizes the `mergeDeep` strategy (you can read more
above merge strategies further below). The `mergeDeep` strategy attempts to
perform an optimistic merge of the persisted state against the store model.
Where it finds that the persisted state is missing keys that are present in the
store model, it will ensure to use the respective state from the store model. It
will also verify the types of data at each key. If there is a misalignment
(ignoring `null` or `undefined`) then it will opt for using the data from the
store model instead as this generally indicates that the respective state has
been refactored.

Whilst the `mergeDeep` strategy is fairly robust and should be able to cater for
a wide variety of model updates, it can't provide a 100% guarantee that a valid
state structure will be resolved.

Therefore, when dealing with production applications, we recommend that you
consider removing this risk. You can do so by utilizing the `version`
configuration property that is available on the store config.

```javascript
const store = createStore(
  persist({
    products: productsModel,
    basket: basketModel,
    session: sessionModel,
  }),
  {
    version: 1, 👈
  },
);
```

This `version` number is a convenient mechanism by which to mark the version of
your store model.

Easy Peasy will be able to compare the version number for the user's persisted
state against that of the current store model. If the versions do not align the
persisted state will be ignored as it is for a previous version of the store
model.

Simply update the `version` any time you perform a significant update to your
store model.

```diff
const store = createStore(
   persist({
     products: productsModel,
     basket: basketModel,
     session: sessionModel,
   }),
   {
-     version: 1,
+     version: 2,
   },
);
```

Whilst this can have a negative effect on user experience, in that their
persisted state will be lost, overall it provides stronger guarantees and
stability for your users.

Please note that this is entirely optional. If you feel confident that your
model changes are simple enough to be resolved by the `mergeDeep` strategy then
there is no need to increment this version number.

## Advanced Tutorial

Below we will cover some of the more advanced aspects of the persist api.

### Merge Strategies

When configuring persistence against your model you can choose from 3 different
merge strategies. Each of them have their own unique merits. We invite you to
read the docs for each below so that you can choose the strategy that will work
best for your needs.

#### mergeDeep

This is the _default_ strategy.

The `mergeDeep` strategy attempts to perform an optimistic merge of the
persisted state against the store model.

The data from the persistence will be merged deeply, recursing through all
_objects_ and then performing a merge for each item within the _object_.

It will not merge arrays and other structures such as Map/Set. If it finds any
of these structures it will use the value defined within the persisted state,
else the value from the store model.

It will also verify the types of data at each key. If there is a misalignment
(ignoring null or undefined) then it will opt for using the data from the store
model instead as this generally indicates that the respective state has been
refactored.

Where it finds that the persisted state is missing keys that are present in the
store model, it will ensure to use the respective state from the store model.

We can demonstrate the above behaviour via the following example.

Given a store with the following definition;

```javascript
import { persist, createStore } from 'easy-peasy';

const store = createStore(
  persist({
    animal: 'dolphin',
    address: {
      city: 'london',
      postCode: 'e3 1pq',
    },
    fruits: ['apple'],
    id: 1,
    name: null,
    counter: 20,
  }),
);
```

And the following persisted state;

```json
{
  "address": {
    "city": "cape town"
  },
  "flagged": true,
  "fruits": ["banana"],
  "id": "one",
  "name": "Wonder Woman",
  "counter": null
}
```

The resulting state will be;

```diff
{
   "animal": "dolphin",

   "address": {
-    "city": "london",
+    "city": "cape town",

     "postCode": "e3 1pq"
   }

+  "flagged": true,

-  "fruits": ["apple"],
+  "fruits": ["banana"],

   "id": 1,

-  "name": null,
+  "name": "Wonder Woman",

-  "counter": 20
+  "counter": null
}
```

We can break down the reasoning behind each state item like so;

- `animal` - The original value from the store model was maintained as their was
  no value within the persisted state
- `address.city` - The persisted state contained a different value for this
  property, and hence this value was used.
- `address.postCode` - The original value from the store model was maintained as
  their was no value within the persisted state
- `flagged` - The store model didn't contain this property, however, as our
  persisted state did we copied it across.
- `fruits` - The persisted state contained a different value for this property,
  and hence this value was used.
- `id` - The persisted state contained a different data type for this property,
  so we assumed the model may have changed and therefore used the store model
  value.
- `name` - The persisted state contained a different value for this property,
  and hence this value was used. Remember `null` and `undefined` don't break the
  type comparison. We consider this a nullable value.
- `counter` - The persisted state contained a different value for this property,
  and hence this value was used. Remember `null` and `undefined` don't break the
  type comparison. We consider this a nullable value.

#### mergeShallow

The `mergeShallow` strategy will compare and merge the properties at the root of
the model it was bound against.

It will not merge arrays and other structures such as Map/Set. If it finds any
of these structures it will use the value defined within the persisted state,
else the value from the store model.

It will also verify the types of data at each key. If there is a misalignment
(ignoring null or undefined) then it will opt for using the data from the store
model instead as this generally indicates that the respective state has been
refactored.

Where it finds that the persisted state is missing keys that are present in the
store model, it will ensure to use the respective state from the store model.

We can demonstrate the above behaviour via the following example.

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
      fruits: ['apple'],
      id: 1,
      name: null,
      counter: 20,
    },
    {
      mergeStrategy: 'mergeShallow',
    },
  ),
);
```

And the following persisted state;

```json
{
  "address": {
    "city": "cape town"
  },
  "flagged": true,
  "fruits": ["banana"],
  "id": "one",
  "name": "Wonder Woman",
  "counter": null
}
```

The resulting state will be;

```diff
{
   "animal": "dolphin",

-  "address": {
-    "city": "london",
-    "postCode": "e3 1pq"
-  },
+  "address": {
+    "city": "cape town"
+  },

+  "flagged": true,

-  "fruits": ["apple"],
+  "fruits": ["banana"],

   "id": 1,

-  "name": null,
+  "name": "Wonder Woman",

-  "counter": 20
+  "counter": null
}
```

We can break down the reasoning behind each state item like so;

- `animal` - The original value from the store model was maintained as their was
  no value within the persisted state
- `address` - As we are doing a `mergeShallow` the `address` from the persisted
  state is used, replacing the `address` from the store model completely. In the
  process the `address.postCode` property from our store model is lost.
- `flagged` - The store model didn't contain this property, however, as our
  persisted state did we copied it across.
- `fruits` - The persisted state contained a different value for this property,
  and hence this value was used.
- `id` - The persisted state contained a different data type for this property,
  so we assumed the model may have changed and therefore used the store model
  value.
- `name` - The persisted state contained a different value for this property,
  and hence this value was used. Remember `null` and `undefined` don't break the
  type comparison. We consider this a nullable value.
- `counter` - The persisted state contained a different value for this property,
  and hence this value was used. Remember `null` and `undefined` don't break the
  type comparison. We consider this a nullable value.

The behaviour of `mergeShallow` may be okay for your use-case, however, if you
update nested models then it is entirely possible that persisted state may not
match the required structure based on the evolved store model. This could cause
errors within your application if your components assumed the existing of a
particular state structure.

We therefore suggest using this strategy _very_ carefully, and encourage you to
use the `mergeDeep` strategy instead.

The `mergeShallow` strategy is perhaps more useful if you would like to define
your persistence on the "leaf" models of your store, like so;

```javascript
import { persist, createStore } from 'easy-peasy';

const model = {
  address: persist(
    {
      city: 'london',
      postCode: 'e3 1pq',
    },
    { mergeStrategy: 'mergeShallow' },
  ),
  todos: persist(
    {
      items: [],
    },
    { mergeStrategy: 'mergeShallow' },
  ),
};
```

#### overwrite

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

```json
{
  "city": "cape town"
}
```

This is perhaps the most risky strategy as we intentionally replace our stores
initial state with that of the persisted state. If the store model has diverged
you could open yourself up to errors/bugs. Please take extra care and
consideration when using this strategy.

### Ensuring persistence completes prior to application unmount

**_Persistence operations are asynchronous._** Therefore if you perform a state
update prior to unmounting your application it is possible that the state change
may not be persisted before your application unmounts.

Your [store instances](/docs/api/store.html) contain an API which allows you to
complete the queued persist operations, specifically the `store.persist.flush()`
API.

When this API is executed any queued persist operations will be immediately
executed, and a `Promise` will be returned. The resolution of the returned
`Promise` indicates that the persist has completed, after which you can safely
continue to unmount the application.

Below are some example utility functions that make use of this API.

```javascript
import store from './store';

export const refreshPage = async () => {
  // Firstly ensure that any outstanding persist operations are complete.
  // Note that this is an asynchronous operation so we will await on it.
  await store.persist.flush();

  // we can now safely reload the page
  window.document.reload();
};

export const redirectTo = async (href) => {
  // Firstly ensure that any outstanding persist operations are complete.
  // Note that this is an asynchronous operation so we will await on it.
  await store.persist.flush();

  // We can now safely redirect the browser
  window.location.href = href;
};
```

### Deleting persisted data

Should you wish to remove all persisted data you can utilise the
[store instance's API](/docs/api/store.html) to do so.

```javascript
const store = createStore(model);

store.persist.clear().then(() => {
  console.log('Persisted state has been removed');
});
```

Note that a `Promise` was returned, which when resolved indicates that the data
removal has completed.

### Rehydrating dynamic models

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
keys created by Easy Peasy, therefore failure to do this can result in the
stores overwriting each others persisted data.

```javascript
const storeOne = createStore(persist(model), {
  name: 'StoreOne', // 👈
});

const storeTwo = createStore(persist(model), {
  name: 'StoreTwo', // 👈
});
```

### Custom storage engines

You can create a custom storage engine by defining an object that satisfies the
following interface:

- `getItem(key) => any | Promise<any> | void`

  This function will receive the cache key and should return the associated
  state from the persistence if it exists. It can alternatively return a
  `Promise` that resolves the state, or `undefined` if no persisted state was
  found.

- `setItem(key, data) => void | Promise<void>`

  This function will receive the cache key as well as the state to persist. It
  should then store the respective data. It can optionally return a `Promise` to
  indicate when the state has been successfully persisted.

- `removeItem(key) => void | Promise<void>`

  This function will receive the cache key and should remove any persisted state
  that is associated with it. It can optionally return a `Promise` to indicate
  when the persisted state has been successfully removed.

Once defined you can provide your custom storage engine to the configuration for
your `persist` instance.

```javascript
import myCustomStorageEngine from './my-custom-storage-engine';

const storeModel = persist(model, {
  storage: myCustomStorageEngine,
});
```

### Custom data transformers

Transforms allow you to customize the state object that gets persisted and
rehydrated. They allow you to for instance convert store data from a complex
object, such as a `Map`, into a structure that is JSON serialisable (and back
again).

Easy Peasy outputs a [`createTransformer`](/docs/api/create-transformer.html)
function, which has been directly copied from
[`redux-persist`](https://github.com/rt2zz/redux-persist) in order to maximum
compatiblity with it's ecosystem.

We recommend you read the
[Redux Persist](https://github.com/rt2zz/redux-persist) documentation on these
for a full understanding.
