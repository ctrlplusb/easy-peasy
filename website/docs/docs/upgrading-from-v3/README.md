This PR is currently published as `easy-peasy@3.4.0-beta.2`

We would appreciate early testing and feedback. 💜

The updated website for this PR can be found at
https://easy-peasy-v3-4-0.now.sh/

## Deprecations

### Deprecated `createComponentStore`

The API for `createComponentStore` was a bit verbose and limited. It will be
removed in the next major release.

I plan to release non breaking changes for a while still, so no stress.

We have introduced a new API, `useLocalStore`, which replaces this one.

## Features

### Adds new `useLocalStore` hook

This API acts as a replacement of the deprecated `createComponentStore` API.

Allows you to create a store to represent the state for an individual React
component. This is essentially an alternative to the official `useState` and
`useReducer` hooks provided by React for component-level state.

```javascript
function MyCounter() {
  const [state, actions] = useLocalStore(() => ({
    count: 0,
    increment: action((_state) => {
      _state.count += 1;
    }),
  }));

  return (
    <div>
      {state.count}
      <button onClick={() => actions.increment()}>+</button>
    </div>
  );
}
```

Please see the
[new API documentation](https://easy-peasy-v3-4-0.now.sh/docs/api/use-local-store.html)
for more information on this API.

Closes #451 Closes #439

### Adds new `effectOn` model API

Allows you to declare an effect within your model which will execute every time
the targeted state changes.

Two arguments are provided to effectOn; namely the `stateResolvers` and the
`handler`. The `stateResolvers` are an array of functions which should resolve
the target state that should be tracked. When the tracked state changes the
`handler` function is executed.

The `handler` can be _asynchronous_ or _synchronous_. It receives the store
actions, a `change` object containing the `prev` values for the targeted state
and the `current` values as well as the `action` that caused the change in
state. It additionally receives a `helper` argument allowing you to access the
store state etc.

The `handler` additionally allows you to return a dispose function, which will
be executed prior to the next execution of the `handler`. This can be useful in
performing things like API call cancellation etc.

```javascript
import { effectOn } from 'easy-peasy';

const todosModel = {
  items: [],
  saving: false,
  setSaving: action((state, payload) => {
    state.saving = payload;
  }),
  onItemsChanged: effectOn(
    // Provide an array of "stateResolvers" to resolve the targeted state:
    [(state) => state.items],
    // Provide a handler which will execute every time the targeted state changes:
    async (actions, change) => {
      const [items] = change.current;
      actions.setSaving(true);
      await todosService.save(items);
      actions.setSaving(false);
    },
  ),
};
```

Closes #419

### TypeScript: Adds support for generics in models

Previously if you defined a model containing generic state, like below,
TypeScript would break within your actions.

```typescript
interface StoreModel<K> {
  data: K;
  updateData: Action<StoreModel<K>, K>;
}

const numberStoreModel: StoreModel<number> = {
  data: 1337,
  updateData: action((state, payload) => {
    // A TypeScript would be thrown at this point
    //     👇
    state.data = payload;
  }),
};
```

Unfortunately we were unable to directly resolve the case of generic properties
due to current limitations with the TypeScript type system. We created a
[StackOverflow question](https://stackoverflow.com/questions/58738700/issue-with-generic-properties-when-type-mapping)
which details the problem.

In a gist; the issue is that Easy Peasy's underlying `State` and `Action` types
map over the user provider model types in order to filter down to types that
represent state and actions respectively. However, when defining a generic
state, TypeScript assumes that the generic state intersects with types that are
trying to be filtered out of each case. Therefore the filtering ends up always
removing your generic state.

To resolve the case of generic state we have introduce a new API helper. Any
time you wish to have a generic state value within your model, simply wrap it
with the `Generic` type, and then assigned the associated value within the model
instance using the `generic` helper.

```typescript
import { Generic, generic } from 'easy-peasy';

interface StoreModel<K> {
  data: Generic<K>; // 👈
  updateData: Action<StoreModel<K>, K>;
}

const numberStoreModel: StoreModel<number> = {
  data: generic(1337), // 👈
  updateData: action((state, payload) => {
    // Note that you don't need to wrap the payload with the
    // helper          👇
    state.data = payload;
  }),
};

numberStoreModel.getState().data;
// 1337

typeof numberStoreModel.getState().data;
// number
```

Note how you only need to use the helper at the point of defining the initial
value of the generic model state. Within your actions and anywhere you consume
the state you would treat the value as the underlying generic value (i.e. a
`number` in the example).

Closes #300 Closes #361

### Improves the persist APIs on the store instances

We had undocumented APIs regarding persistence that were being exposed on the
store instances. These are helpful in many cases, such as being able to flush
persistence prior to navigating away from your application, or awaiting for
persisted data to be rehydrated prior to rendering your application. We highly
recommend you read the respective Store API docs.

Closes #454

### Removes limit on TypeScript model mapping

Previously, if you had a model more than 6 levels deep, in terms of object
structure, the TypeScript mapping wouldn't work as expected. This is no longer
the case.

I still think having that deep of a model is a bit excessive though. 😅

### Replaces `immer-peasy` with official `immer`

We have replaced our forked/patched version of immer with the official version.
Thanks to their newly released support for computed properties. 🎉

Closes #462 Closes #446 Closes #440

### Adds ability to await on rehydration of persisted data for dynamically added model

When utilising `persist` against a dynamically added model, i.e. via
`store.addModel`, you may need to await on the rehydration due to utilising an
asynchronous storage engine.

You can now do so via the returned `resolveRehydration` helper.

```typescript 👇
const { resolveRehydration } = store.addModel('products', productsModel);
//            👆
// Deconstruct the returned object to get a handle on resolveRehydration

//     as we are using an asynchronous storage engine we will await the
// 👇 the promise returned by the resolveRehydration function.
resolveRehydration().then(() => {
  console.log('Rehydration is complete');
});
```

Closes #444

### Moves internal `redux-thunk` binding to grant user defined middleware higher priority

This will allow you to influence thunks prior to their execution. For advanced
cases. 😊

Closes #390

## Patches

### TypeScript: Loads of fixes and improvements to the typings

The typings are being combed over multiple times and various fixes and
improvements are being made. This is an ongoing task and you can expect many
more improvements to be made still, including the addition of proper
documentation on each type within the typings. This should improve the dev
experience within your editor as you will get inline guidance on the APIs along
with links to the official documentation for them.

### Fixes `persist` data not rehydrated for dynamically added models

Data persisted within models added via the `store.addModel` API were not having
their data rehydrated. This is now fixed.

Closes #444

### Fixes `merge` and `mergeDeep` strategies for `persist` rehydration

A bug was identified where it was possible for persisted state to be misaligned
with an evolving datamodel in terms of data types.

For example, you could have the following state persisted:

```json
{
  "counter": {
    "count": 1337
  },
  "todos": ["one", "two", "three"]
}
```

And since the state was persisted there occurred an update to the data model:

```typescript
const storeModel = {
  counter: {
    count: 1,
    increment: action(/* ... */),
  },
  todos: {
    items: ['one', 'two', 'three'],
    addTodo: action(/* ... */),
  },
};
```

Note how the data structure for `todos` has evolved since the persisted state.
It is now an object with nested properties.

Previously, for `merge` and `mergeDeep` it did not take into consideration the
evolving store model and would rehydrate a persisted state despite it being
misaligned in terms of tree data type structure. With the fix if a misaligned
data type is found then the data specified on the store model is used instead of
the persisted state.

The logic for this ignores values where they are `null` or `undefined`, but
otherwise will compare data types of the model vs persisted state to ensure the
types match. If the types do not match then the store model is used over the
persisted value. So for our example above the rehydrated state would be the
following:

```json
{
  "counter": {
    "count": 1337
  },
  "todos": {
    "items": ["one", "two", "three"]
  }
}
```

Note how `todos.items` matches the store model rather than the persisted state.

Moving forward we strongly recommend that the `mergeDeep` strategy is used when
rehydrating state. This will ensure that the types are aligned right down the
entire tree of the persisted state vs your store model.

Closes #355

### TypeScript: Fixes the statemapper eating up "classes"

If you assigned a class instance to your state the typings from `getState` /
`useStoreState` etc would report your type as being something similar to:

<img width="586" alt="Screenshot 2020-03-21 20 05 29" src="https://user-images.githubusercontent.com/12164768/77227201-725c6100-6bb9-11ea-8ab8-747bf6e56954.png">

With this fix your state will correctly be reported back as the actual class
type (`Person` in the examples case).

Closes #402

### TypeScript: Fixes action mapper so that state isn't display when viewing actions

The VSCode intellisense for actions was showing state. The types have been
patched so that only actions will beb displayed.

### TypeScript: Fixes state mapper where actions were still being represented on state

There were cases if you had a nested action and only primitive state next to it
that you would see the nested action. This is no longer the case.

### TypeScript: Fixes computed properties state resolvers not inferring resolved types correctly

If you used a state resolver array within your computed properties, whilst using
TypeScript, the inferred types based on the resolved state was incorrect. This
is now fixed.

Closes #427

### Website: Adds a known issue in regards to computed properties + Typescript

Unfortunately, due to the way our typing system maps your model, you cannot
declare a computed property as being optional via the `?` property postfix.

For example:

```typescript
interface StoreModel {
  products: Product[];
  totalPrice?: Computed<StoreModel, number>;
  //       👆
  // Note the optional definition
}

const storeModel: StoreModel = {
  products: [];
  // This will result in a TypeScript error 😢
  totalPrice: computed(
    state => state.products.length > 0
      ? calcPrice(state.products)
      : undefined
  )
}
```

Luckily there is a workaround; simply adjust the definition of your computed
property to indicate that the result could be undefined.

```diff
  interface StoreModel {
    products: Product[];
-   totalPrice?: Computed<StoreModel, number>;
+   totalPrice: Computed<StoreModel, number | undefined>;
  }
```

### Fixes computed properties error for dynamically added model

Thanks goes to @jchamb for this fix. 💜

Computed properties were throwing errors intermittently when the
`store.addModel` API was being used. This fix puts a guard in place to protect
against the error.

### Fixes an error on the website -> docs -> quick-start.md

Thanks goes to @hualu00 for this fix. 💜

### Replaces `rollup` with `microbundle` to bundle library

Saves some more valuable bytes in bundlesize.

Closes #452

### Updates website to include known issue on computed property destructuring

Closes #386

### Improves the `persist` API documentation

Closes #454

### Adds "Community Extensions" page to website

Closes #359
