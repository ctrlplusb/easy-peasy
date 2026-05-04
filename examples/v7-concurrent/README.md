# Easy Peasy v7 — Concurrent React example

A single-page demo exercising every concurrent hook introduced in v7.

| Section | API demonstrated |
| --- | --- |
| Counter | `useStoreRehydrated` + `<Suspense>` (Suspense-based rehydration of a persisted slice) |
| Catalog search | `useStoreTransition` (non-blocking thunk dispatch) and `useStoreDeferredState` (stale-while-fresh selector) |
| Todos | `useStoreOptimistic` (optimistic UI while a thunk is in flight) |

## Run

```sh
yarn install
yarn dev
```

Then open <http://localhost:3000>.

The persisted counter writes to `localStorage`. Increment, reload, and the
value is restored after the Suspense fallback resolves.
