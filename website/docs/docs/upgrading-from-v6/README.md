# Upgrading from v6 to v7

Easy Peasy v7 modernises the library around React 19, adopting the new
concurrent primitives (`useTransition`, `useDeferredValue`, `useOptimistic`,
`use`, and Suspense for asynchronous rehydration). The public store/model API
is unchanged — most consumers should be able to upgrade without touching their
store definitions.

This guide walks you through the breaking changes and the new APIs.

- [Quick checklist](#quick-checklist)
- [Breaking changes](#breaking-changes)
  - [React 19 is required](#react-19-is-required)
  - [`useStoreRehydrated` now suspends](#usestorerehydrated-now-suspends)
  - [`easy-peasy/proxy-polyfill` subpath removed](#easy-peasyproxy-polyfill-subpath-removed)
- [New APIs](#new-apis)
  - [`useStoreTransition`](#usestoretransition)
  - [`useStoreDeferredState`](#usestoredeferredstate)
  - [`useStoreOptimistic`](#usestoreoptimistic)
  - [`easy-peasy/server` subpath export](#easy-peasyserver-subpath-export)
- [Internal changes worth knowing](#internal-changes-worth-knowing)

## Quick checklist

1. Upgrade `react` and `react-dom` to `^19`.
2. Upgrade `easy-peasy` to `^7`.
3. Wrap any subtree that uses [`useStoreRehydrated`](/docs/api/use-store-rehydrated.html)
   in a [`<Suspense>`](https://react.dev/reference/react/Suspense) boundary;
   the hook now suspends instead of returning `false` while rehydrating.
4. (Optional) Adopt the new concurrent hooks where they help —
   [`useStoreTransition`](/docs/api/use-store-transition.html),
   [`useStoreDeferredState`](/docs/api/use-store-deferred-state.html),
   [`useStoreOptimistic`](/docs/api/use-store-optimistic.html).
5. (Optional) If you build stores in React Server Components, edge runtimes,
   or other React-free environments, switch those imports to
   [`easy-peasy/server`](/docs/api/easy-peasy-server.html).

## Breaking changes

### React 19 is required

The peer dependency range is now `react@^19` and `react-dom@^19`. v6 supported
React 18 and 19; v7 drops the React 18 support so the library can use
`useOptimistic`, `use`, and a simpler Suspense-based rehydration story
internally.

If you are not yet on React 19, stay on `easy-peasy@^6`.

### `useStoreRehydrated` now suspends

Prior to v7, [`useStoreRehydrated`](/docs/api/use-store-rehydrated.html)
returned a boolean — `false` while rehydration was in flight, `true` once
complete. Call sites typically gated rendering on the boolean:

```javascript
// v6
function App() {
  const isRehydrated = useStoreRehydrated();
  return isRehydrated ? <Main /> : <div>Loading...</div>;
}
```

In v7 the hook **suspends** instead. Replace the conditional with a
[`<Suspense>`](https://react.dev/reference/react/Suspense) boundary:

```javascript
// v7
import { Suspense } from 'react';

function Main() {
  useStoreRehydrated();
  return <App />;
}

function Root() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Main />
    </Suspense>
  );
}
```

The hook still returns `true` once it resolves, so existing call sites that
read the boolean continue to compile — but the "loading" branch is now
unreachable and should be removed in favour of the Suspense fallback.

If you previously wrote a wrapper component:

```diff
- function WaitForStateRehydration({ children }) {
-   const isRehydrated = useStoreRehydrated();
-   return isRehydrated ? children : null;
- }
+ function WaitForStateRehydration({ children }) {
+   useStoreRehydrated();
+   return children;
+ }

  createRoot(document.getElementById('app')).render(
    <StoreProvider store={store}>
+     <Suspense fallback={<div>Loading...</div>}>
        <WaitForStateRehydration>
          <App />
        </WaitForStateRehydration>
+     </Suspense>
    </StoreProvider>,
  );
```

> **Why this changed:** in React 19 the idiomatic way to gate UI on an async
> resource is via `use()` + `<Suspense>`. The previous boolean-flag pattern
> required a state subscription on every consumer; the Suspense pattern lets
> React deliver the rehydrated tree in a single render once the data is ready,
> with no flash of default state.

### `easy-peasy/proxy-polyfill` subpath removed

v6 shipped an `easy-peasy/proxy-polyfill` subpath which called immer's
`enableES5()` helper to support environments without native `Proxy` (notably
IE11). Easy Peasy v7 upgrades to immer v11, which dropped ES5 mode entirely —
`Proxy` is now the only supported backend.

If you imported the subpath:

```diff
- import 'easy-peasy/proxy-polyfill';
```

…remove the import. Every browser supported by React 19 has native `Proxy`, so
no replacement is needed.

The `easy-peasy/map-set-support` subpath (which calls `enableMapSet()`) is
unchanged — Map/Set draft support is still opt-in in immer v11.

## New APIs

### `useStoreTransition`

Wraps action dispatches in
[`startTransition`](https://react.dev/reference/react/startTransition) and
exposes an `isPending` flag for non-urgent updates. Use it for actions that
trigger expensive re-renders (large list updates, sort/filter changes, thunks
with multiple incremental commits).

```javascript
import { useStoreTransition } from 'easy-peasy';

function FetchButton() {
  const [fetchItems, isPending] = useStoreTransition(
    (actions) => actions.fetchItems,
  );
  return (
    <button disabled={isPending} onClick={() => fetchItems()} type="button">
      {isPending ? 'Loading...' : 'Fetch'}
    </button>
  );
}
```

The selector can return either a single function or an object of functions;
function leaves are wrapped recursively. Wrapped thunks return their original
promise. See the [reference docs](/docs/api/use-store-transition.html) for
more.

### `useStoreDeferredState`

Combines [`useStoreState`](/docs/api/use-store-state.html) with
[`useDeferredValue`](https://react.dev/reference/react/useDeferredValue) so
that React can keep returning the previous selected value while a fresh value
is being computed. Useful for expensive selectors where a stale-while-fresh
read is acceptable.

```javascript
import { useStoreDeferredState } from 'easy-peasy';

function Results({ query }) {
  const matches = useStoreDeferredState((state) =>
    state.products.items.filter((p) => p.name.includes(query)),
  );
  return <ul>{matches.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

See the [reference docs](/docs/api/use-store-deferred-state.html) for more.

### `useStoreOptimistic`

Combines [`useStoreState`](/docs/api/use-store-state.html) with
[`useOptimistic`](https://react.dev/reference/react/useOptimistic). Components
can render an optimistic value while a pending action is in flight; once the
underlying state changes the optimistic value is discarded.

```javascript
import { startTransition } from 'react';
import { useStoreActions, useStoreOptimistic } from 'easy-peasy';

function TodoList() {
  const [items, addOptimistic] = useStoreOptimistic(
    (state) => state.todos.items,
    (current, pending) => [...current, pending],
  );
  const addItemAsync = useStoreActions((a) => a.todos.addItemAsync);
  return (
    <button
      onClick={() => {
        startTransition(async () => {
          addOptimistic({ id: 'new', text: 'Hello' });
          await addItemAsync({ text: 'Hello' });
        });
      }}
      type="button"
    >
      Add
    </button>
  );
}
```

See the [reference docs](/docs/api/use-store-optimistic.html) for more.

### `easy-peasy/server` subpath export

A React-free entry point that exposes the store, helpers, and types but none
of the React hooks or `StoreProvider`. Use it inside React Server Components,
edge runtimes, or any context where importing React would be incorrect.

```javascript
import { createStore, action } from 'easy-peasy/server';
```

See the [reference docs](/docs/api/easy-peasy-server.html) for more, including
an end-to-end RSC + client-hydration example. For App Router specifics —
where to put `'use client'`, the per-request store rule, and Suspense +
streaming behaviour — see the
[Usage with RSC / Next App Router](/docs/recipes/usage-with-rsc-and-next-app-router.html)
recipe.

## Internal changes worth knowing

These don't change the public API but may affect the runtime feel:

- **Rehydration `replaceState` is wrapped in `startTransition`.** When persisted
  data lands, the resulting state replacement is marked as a transition, so
  the rehydration render is non-blocking and never preempts urgent input
  updates. No code changes are required to take advantage of this.
- **`useStoreState` uses React's `useSyncExternalStore` directly** (with a
  selector + memoisation layer on top). The behaviour is observably the same
  as in v6, but the implementation no longer ships the legacy
  `use-sync-external-store` shim.

If you hit anything that this guide doesn't cover, please
[open an issue](https://github.com/ctrlplusb/easy-peasy/issues).
