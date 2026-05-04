# useStoreRehydrated

This hook is useful when making use of the [persist](/docs/api/persist.html) API
along with an asynchronous storage engine.

When you rehydrate a persisted state from an asynchronous storage engine you may
experience a flash of content where your application initially renders based on
your store's default state, and then re-renders with the rehydrated state once
the asynchronous read completes.

To eliminate that flash, this hook **suspends** while the rehydration is in
flight. Wrap any subtree that depends on rehydrated state in a
[`<Suspense>`](https://react.dev/reference/react/Suspense) boundary and React
will display your fallback until rehydration finishes, at which point the real
content renders. The hook always returns `true` once it resolves.

> **v7 breaking change:** prior to v7, this hook returned a boolean (`false`
> while rehydrating, `true` once complete). It now suspends instead. Existing
> call sites that conditionally rendered on the boolean still compile but the
> "loading" branch is unreachable. Migrate to a `<Suspense>` boundary as shown
> below. See the [v6 → v7 migration guide](/docs/upgrading-from-v6/) for the
> full upgrade path.

## Example

In the example below, the `<Main />` content suspends until our store has been
successfully updated with the rehydrated state, at which point React swaps the
fallback for the rehydrated UI.

```javascript
import { Suspense } from 'react';
import { useStoreRehydrated } from 'easy-peasy';

const store = createStore(persist(model, { storage: asyncStorageEngine }));

function Main() {
  useStoreRehydrated();
  return <App />;
}

function Root() {
  return (
    <StoreProvider store={store}>
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <Main />
      </Suspense>
      <Footer />
    </StoreProvider>
  );
}
```

Alternatively you can encapsulate the gate in a small wrapper component:

```javascript
import { Suspense } from 'react';
import { useStoreRehydrated } from 'easy-peasy';

function WaitForStateRehydration({ children }) {
  useStoreRehydrated();
  return children;
}

function Root() {
  return (
    <StoreProvider store={store}>
      <Suspense fallback={<div>Loading...</div>}>
        <WaitForStateRehydration>
          <App />
        </WaitForStateRehydration>
      </Suspense>
    </StoreProvider>
  );
}
```
