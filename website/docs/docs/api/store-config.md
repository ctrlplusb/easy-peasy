# StoreConfig

When creating your stores you can provide configuration for more advanced
scenarios. In most cases you shouldn't need to reach for these configuration
options, however, they can be useful so it is good to familiarise yourself with them.

We have split the configuration parameters into two groupings, standard and
advanced. The advanced configuration options cover the options used to customise
the underlying Redux store.

## Standard configuration

- `name` (string, not required, default=EasyPeasyStore)

  Allows you to customise the name of the store. This is especially useful when you are creating multiple stores as you will easily be able to distinguish and toggle between the different store instances within the Redux dev tools.

- `devTools` (bool, not required, default=true)

  Setting this to `true` will enable the [Redux Dev Tools Extension](https://github.com/zalmoxisus/redux-devtools-extension).

- `initialState` (Object, not required, default=undefined)

  Allows you to hydrate your store with initial state (for example state received from your server in a server rendering context).

- `injections` (Any, not required, default=undefined)

  Any dependencies you would like to inject, making them available to your effect actions. They will become available as the 4th parameter to the effect handler. See the [effect](#effectaction) docs for more.

- `mockActions` (boolean, not required, default=false)

  Useful when testing your store, especially in the context of thunks. When set to `true` none of the actions dispatched will update the state, they will be instead recorded and can be accessed via the `getMockedActions` API that is added to the store.  Please see the ["Writing Tests"](#writing-tests) section for more information.

## Advanced configuration

Under the hood we use Redux. You can customise the Redux store via the following Redux-specific configuration properties:

- `compose` (Function, not required, default=undefined)

  Custom [`compose`](https://redux.js.org/api/compose) function that will be used in place of the one from Redux. This is especially useful in the context of React Native and other environments. See the Usage with React Native notes.

- `enhancers` (Array, not required, default=[])

  Any custom [store enhancers](https://redux.js.org/glossary#store-enhancer) you would like to apply to your Redux store.

- `middleware` (Array, not required, default=[])

  An array of Redux [middleware](https://redux.js.org/glossary#middleware) you would like to attach to your store.

- `reducerEnhancer` (Function, not required, default=(reducer => reducer))

  Any additional reducerEnhancer you would like to enhance to your root reducer (for example you want to use [redux-persist](https://github.com/rt2zz/redux-persist)).