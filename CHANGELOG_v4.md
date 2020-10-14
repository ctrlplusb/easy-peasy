The long wait is over.

v4 has arrived! 🎉

This release includes an insane amount of improvements and fixes, with an
ironing over some of the APIs and features that were introduced in v3.

This release will also include a completely overhauled website. This work is
still in progress and is likely to continue even after the v4 release. It's a
lot of work and I don't want it to be the sole reason for us holding back on the
v4 release.

Unfortunately there are breaking changes, however, I expect the breaking changes
will only impact a subset of our userbase that are using the more advanced
features of Easy Peasy.

## Breaking Changes

### Replaced `createComponentStore` with a `useLocalStore` hook

The API for `createComponentStore` was a verbose and limited.

Taking learnings from it we have replaced it with a new API; namely
`useLocalStore`.

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
[API documentation](https://easy-peasy.now.sh/docs/api/use-local-store.html) for
more information.

### Persist API rewrite

The [persist](https://easy-peasy.now.sh/docs/api/persist.html) API received a
huge overhaul to the point that it should essentially be considered a rewrite.

We suggest that you read the
[updated docs](https://easy-peasy.now.sh/docs/api/persist.html) and update your
implementations accordingly.

Some notable changes include:

- API is now always asynchronous in terms of persisting and rehydrating. This
  allows us to support a single recommended API structure for implementing
  persisting and rehydration.
- Persist operations are now optimised utilizing a combination of the browser's
  requestIdleCallback or requestAnimationFrame APIs.
- The merge strategies have been renamed as follows:
  - mergeDeep
  - mergeShallow
  - overwrite
- The mergeDeep strategy is now the default
- Merging strategies are now sensitive to model updates. If we note a type
  difference comparing the store model's initial state to persisted state we
  will use the store model's initial state instead as it likely indicates an
  evolved model. Null or undefined values are excluded from this comparison.
- A "version" number has been introduced on the creatStore config. If you
  utilize this value we will compare the persisted state version number against
  the current store version number - if they do not align the persisted state
  will be ignored. This gives you absolute guarantees if you wish to ship a
  refactored store model without worrying about breaking clients with already
  persisted state.
- New APIs and support has been added for managing rehydration of dynamically
  added models.
- A huge number of bug fixes. Some of these marked as critical.

### Upgraded to `immer@7`

We used to managed a forked version of [Immer](https://github.com/immerjs/immer)
as it previously did not support computed properties. This is no longer the
case! We now rely on the native Immer package.

A side effect of this is that you may experience browser support issues for
browsers that do not support support
[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

If you require your application to work on such environments (e.g. Internet
Explorer 11 or some versions of React Native on Android) then please ensure that
you import and execute the `enableES5` feature from Immer.

```javascript
import { enableES5 } from 'immer';

enableES5();
```

### Moved internal `redux-thunk` binding to grant user defined middleware higher priority

This will allow you to influence thunks prior to their execution. For advanced
cases.

This likely will have zero impact on anyone, but given the nature of the change
we are marking it as breaking.

### Thunk action states, error handling, and listener behaviour updates

Easy Peasy will no longer catch any errors within your thunks and dispatch a
"failed" state action. If you wish to explicitly mark your thunk as failed, so
that an action listener can respond to it accordingly then you need to use the
new `fail` helper that is provided to thunks.

```javascript
const model = {
  myNaughtyThunk: thunk((actions, payload, helpers) => {
    try {
      await axios.get('/an-endpoint-that-fails');
    } catch (err) {
      // This will dispatch a @thunk.myNaughtyThunk(fail) action with the err attached
      fail(err);
    }
  })
};
```

Error handling is now explicitly your responsibility.

The actions that are dispatch to represent thunk states have been updated.
Taking the example above here are the possible action types that will be
dispatched and visible in the redux dev tools:

- `@thunk.myThunk(start)`

  Dispatched at the start of a thunk execution.

- `@thunk.myThunk(success)`

  Dispatched when a thunk has completed - i.e. with no uncaught errors
  occurring.

- `@thunk.myThunk(fail)`

  Dispatched if the `fail` helper was called. In this case the
  `@thunk.myThunk(success)` would not have been dispatched.

Listeners (actionOn and thunkOn) will now by default only respond to the
"success" event of a thunk. If you wish to handle the "fail" events then you
will need to explicitly resolve them.

```javascript
onAddTodoFailed: actionOn(
  (actions) => actions.saveTodo.failType,
  (state, target) => {
    state.auditLog.push(`Failed to save todo: ${target.payload}`);
  },
);
```

## New Features

### `unstable_effectOn`

> **\*Note:** this is an experimental API. We are pre-releasing it to allow for
> early feedback. The API is subject to breaking changes with any release of
> Easy Peasy. As such we have prefixed the API with "unstable*", much like React
> does with its experimental APIs. Once the API has stabilised the "unstable*"
> prefix will be removed and semver based releases will be respected.\*

Allows you to declare an effect within your model which will execute every time
the targeted state changes.

Two arguments are provided to unstable_effectOn; namely the `stateResolvers` and
the `handler`. The `stateResolvers` are an array of functions which should
resolve the target state that should be tracked. When the tracked state changes
the `handler` function is executed.

The `handler` can be _asynchronous_ or _synchronous_. It receives the store
actions, a `change` object containing the `prev` values for the targeted state
and the `current` values as well as the `action` that caused the change in
state. It additionally receives a `helper` argument allowing you to access the
store state etc.

The `handler` additionally allows you to return a dispose function, which will
be executed prior to the next execution of the `handler`. This can be useful in
performing things like API call cancellation etc.

```javascript
import { unstable_effectOn } from 'easy-peasy';

const todosModel = {
  items: [],
  saving: false,
  setSaving: action((state, payload) => {
    state.saving = payload;
  }),
  unstable_effectOn(
    // Provide an array of "stateResolvers" to resolve the targeted state:
    [state => state.items],
    // Provide a handler which will execute every time the targeted state changes:
    async (actions, change) => {
      const [items] = change.current;
      actions.setSaving(true);
      await todosService.save(items);
      actions.setSaving(false);
    }
  )
};
```

### Context stores now allow you to override injections at runtime

Simply pass your injections as a prop to the `Provider` for the context store.

See the
[updated docs](https://easy-peasy.now.sh/docs/api/create-context-store.html) for
more information.

## Fixes

### Computed properties are now immutable bound to state

Previously if you executed a computed property it would always resolve against
the latest version of the store state. Now it will operate against the state at
the moment of time it was pulled out from.

In doing this we also addressed a strange case where you may get an error for
invalid computed property access.

### Internals rewritten to utilize incoming model definitions immutably

This will address any issues where you may have been providing model definitions
to different stores.

## TypeScript

### Loads of fixes and improvements to the typings

Phew. Too many to mention. Just take our word for it. Tons of nitty issues have
been addressed.

### Added support for generics in models

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

### Removed the limit on TypeScript model depth

Previously, if you had a model more than 6 levels deep, in terms of object
structure, the TypeScript mapping wouldn't work as expected. This is no longer
the case.

### Fixed the statemapper eating up "classes"

If you assigned a class instance to your state the typings from `getState` /
`useStoreState` etc would report your type as being something similar to:

<img width="586" alt="Screenshot 2020-03-21 20 05 29" src="https://user-images.githubusercontent.com/12164768/77227201-725c6100-6bb9-11ea-8ab8-747bf6e56954.png">

With this fix your state will correctly be reported back as the actual class
type (`Person` in the examples case).

### Fixed action mapper so that state isn't display when viewing actions

The VSCode intellisense for actions were showing state. The types have been
patched so that only actions will be displayed.

### Fixed state mapper where actions were still being represented on state

There were cases if you had a nested action and only primitive state next to it
that you would see the nested action. This is no longer the case.

### Fixed computed properties state resolvers not inferring resolved types correctly

If you used a state resolver array within your computed properties, whilst using
TypeScript, the inferred types based on the resolved state was incorrect. This
is now fixed.
