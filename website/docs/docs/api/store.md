# Store

A store is created via the [createStore](/docs/api/create-store) API. A store instance contains the following properties.

  - `clearMockedActions` (Function)

    If the `mockActions` configuration value was passed to the `createStore` then calling this function clears the list of mocked actions that have been tracked by the store. This is useful in the context of testing - especially thunks.

  - `dispatch` (Function)

    Allows you to manually dispatch actions, ala Redux.

  - `getActions` (Function)

    Returns the actions of your store.

  - `getState` (Function, required)

    Returns the state of your store.

  - `getMockedActions` (Function)

    If the `mockActions` configuration value was passed to the `createStore` then calling this function will return the actions that have been dispatched (and mocked). This is useful in the context of testing - especially thunks.

  - `useStoreActions` (Function)

    The [useStoreActions](/docs/api/use-store-actions) hook. This is typically useful when using Typescript with Easy Peasy, as this hook will be typed against your store.

  - `useStoreDispatch` (Function)

    The [useStoreDispatch](/docs/api/use-store-dispatch) hook. This is typically useful when using Typescript with Easy Peasy, as this hook will be typed against your store.

  - `useStoreState` (Function)

    The [useStoreState](/docs/api/use-store-state) hook. This is typically useful when using Typescript with Easy Peasy, as this hook will be typed against your store.

It may be useful to note that a store is a Redux store, with enhancements. All the standard APIs that are available on Redux store are available on an Easy Peasy store.