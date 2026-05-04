# easy-peasy/server

`easy-peasy/server` is a React-free subpath export, intended for use in
environments where importing React would be incorrect — most notably
[React Server Components](https://react.dev/reference/rsc/server-components),
edge runtimes, and Node.js scripts that build store snapshots without a
component tree.

The subpath exports the full **store and model API** but **none of the React
hooks or the `StoreProvider`**. That means you can build a store, dispatch
actions, read state, and serialise the result on the server without pulling
React into your bundle.

## What is exported

The subpath re-exports the following from the main entry:

  - Store factories: `createStore`, `createTransform`
  - Helpers: `action`, `actionOn`, `computed`, `debug`, `effectOn`, `generic`,
    `persist`, `reducer`, `thunk`, `thunkOn`
  - Types: `Store`, `EasyPeasyConfig`, `Action`, `ActionOn`, `Thunk`, `ThunkOn`,
    `Computed`, `EffectOn`, `Reducer`, `Dispose`, `Listeners`, `Actions`,
    `State`, `Dispatch`, `ReduxAction`, `MockedAction`, `AddModelResult`,
    `PersistStorage`, `PersistConfig`, `TransformConfig`, `Transformer`,
    `Generic`

## What is _not_ exported

Anything React-bound is intentionally absent:

  - `StoreProvider`
  - `useStoreState`, `useStoreActions`, `useStoreDispatch`, `useStore`,
    `useStoreRehydrated`, `useStoreTransition`, `useStoreDeferredState`,
    `useStoreOptimistic`
  - `createContextStore`, `useLocalStore`
  - `createTypedHooks`

If you need any of these, import from the main `easy-peasy` entry point in a
client component (i.e. one annotated with `'use client'`).

## Example: building a store inside a React Server Component

```javascript
// app/products/page.js — a React Server Component
import { createStore, persist, action } from 'easy-peasy/server';
import { ProductsView } from './products-view'; // 'use client'

const productsModel = {
  items: [],
  setItems: action((state, payload) => {
    state.items = payload;
  }),
};

export default async function ProductsPage() {
  const items = await fetch('https://example.com/api/products').then((r) =>
    r.json(),
  );

  const store = createStore(productsModel);
  store.getActions().setItems(items);

  // Pass the serialised initial state down to the client component, which
  // can hydrate its own client-side store with it.
  return <ProductsView initialState={store.getState()} />;
}
```

## Example: hydrating a client store from a server-rendered snapshot

```javascript
// products-view.js
'use client';

import { createStore, StoreProvider } from 'easy-peasy';
import { productsModel } from './model';

export function ProductsView({ initialState }) {
  const store = createStore(productsModel, {
    initialState,
  });
  return (
    <StoreProvider store={store}>
      <ProductsList />
    </StoreProvider>
  );
}
```
