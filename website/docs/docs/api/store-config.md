# StoreConfig

When [creating your stores](/docs/api/create-store.html) you can provide
configuration for more advanced scenarios.

We have split the configuration parameters into two groupings, standard and
advanced. The advanced configuration options are used to customise the
underlying Redux store.

## Standard configuration

- `name` (string, _optional_, default=EasyPeasyStore)

  Allows you to customise the name of the store. This is especially useful when
  you are creating multiple stores as you will easily be able to distinguish the
  store instances within the
  [Redux Dev Tools Extension](https://github.com/zalmoxisus/redux-devtools-extension).

- `version` (number, _optional_, default=0)

  Allows you to tag the "version" of your store. This is particularly useful
  when utilizing the persist APIs as they reference the version number to ensure
  that any persisted state matches the required store version prior to
  rehydrating the store. You can read more about this within the
  [persist](/docs/api/persist.html) docs.

- `devTools` (boolean | Object, _optional_, default=true)

  Setting this to `false` will disable the Redux Dev Tools Extension.

  If you need to
  [configure Redux Dev Tools with custom parameters](https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md),
  you can do so by passing in an object.

  > Note: dev tools will be enabled by default if your
  > `process.env.NODE_ENV !== 'production'`.

- `disableImmer` (boolean, _optional_, default=false)

  If you set this to true, then [immer](https://github.com/mweststrate/immer)
  will be disabled, meaning you can no longer mutate state directly within
  actions and will instead have to return new immutable state as is typical of
  standard Redux reducers.

- `initialState` (Object, _optional_, default=undefined)

  Allows you to hydrate your store with initial state (for example state
  received from your server in a server rendering context).

- `injections` (Object, _optional_, default=undefined)

  Any dependencies you would like to exposed to your thunks and effects. These
  are exposed via the `helpers` argument to both APIs.

- `mockActions` (boolean, _optional_, default=false)

  Useful when testing your store, especially in the context of thunks. When set
  to `true` none of the actions dispatched will update the state, they will be
  instead recorded and can be accessed via the `getMockedActions` API that is
  added to the store. Please see the ["Testing"](/docs/testing/) section for
  more information.

## Advanced configuration

Under the hood we use Redux. You can customise the Redux store via the following
Redux-specific configuration properties:

- `compose` (Function, _optional_, default=undefined)

  Custom [`compose`](https://redux.js.org/api/compose) function that will be
  used in place of the one from Redux. This is especially useful in the context
  of React Native and other environments. See the Usage with React Native notes.

- `enhancers` (Array, _optional_, default=[])

  Any custom [store enhancers](https://redux.js.org/glossary#store-enhancer) you
  would like to apply to your Redux store.

- `middleware` (Array, _optional_, default=[])

  An array of Redux [middleware](https://redux.js.org/glossary#middleware) you
  would like to attach to your store.

- `reducerEnhancer` (Function, _optional_, default=(reducer => reducer))

  Any additional reducerEnhancer you would like to enhance to your root reducer
  (for example you want to use
  [redux-persist](https://github.com/rt2zz/redux-persist)).
