# Usage with React Server Components / Next.js App Router

Easy Peasy works well alongside React Server Components (RSC) and the Next.js
App Router, but the boundary between server and client code makes the "where
does the store live?" question more nuanced than in a single-page app. This
recipe walks through the patterns that work and the pitfalls to avoid.

> **Background reading:**
> [`easy-peasy/server`](/docs/api/easy-peasy-server.html) — the React-free
> subpath you'll use for any server-side store work.

- [Three integration patterns](#three-integration-patterns)
- [Pattern 1: client-only store under the App Router](#pattern-1-client-only-store-under-the-app-router)
- [Pattern 2: server-prepared snapshot, client-side store](#pattern-2-server-prepared-snapshot-client-side-store)
- [Pattern 3: read-only store inside a server component](#pattern-3-read-only-store-inside-a-server-component)
- [Pitfalls and gotchas](#pitfalls-and-gotchas)
- [`useStoreRehydrated` and streaming](#usestorerehydrated-and-streaming)

## Three integration patterns

There is no single "right" way to combine Easy Peasy with the App Router. Pick
the pattern that matches what you actually need:

| Pattern | When to use |
| --- | --- |
| Client-only store | Pages are server-rendered for SEO/streaming, but all state lives in the client. Most apps. |
| Server-prepared snapshot, client-side store | A server component already has the data; you want to pre-populate the client store to avoid a flash and a second fetch. |
| Read-only store inside a server component | You want to reuse model logic (computed properties, transforms, persist read) on the server to derive values for HTML, with no interactivity. |

## Pattern 1: client-only store under the App Router

The App Router renders server components by default. To use Easy Peasy hooks,
the `StoreProvider` (and any component that calls `useStoreState`,
`useStoreActions`, etc.) must live inside a client component. The
recommended shape is a single `StoreProvider` client component that wraps
everything below it.

```javascript
// app/store-provider.jsx
'use client';

import { useRef } from 'react';
import { createStore, StoreProvider as EasyPeasyProvider } from 'easy-peasy';
import { storeModel } from './store-model';

export function StoreProvider({ children }) {
  // Create the store once per Provider instance — never at module scope on
  // the server (see "Pitfalls" below).
  const storeRef = useRef(null);
  if (storeRef.current === null) {
    storeRef.current = createStore(storeModel);
  }
  return (
    <EasyPeasyProvider store={storeRef.current}>{children}</EasyPeasyProvider>
  );
}
```

```javascript
// app/layout.jsx — server component
import { StoreProvider } from './store-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
```

`storeModel` itself is plain data + helpers, so it can be imported from a
shared module — no `'use client'` needed there.

## Pattern 2: server-prepared snapshot, client-side store

If a server component already fetched the data the user is about to see, hand
it to the client store via `initialState` to avoid a duplicate fetch and a
flash of empty UI.

```javascript
// app/products/store-model.js — shared model
import { action } from 'easy-peasy';

export const productsModel = {
  items: [],
  setItems: action((state, payload) => {
    state.items = payload;
  }),
};
```

```javascript
// app/products/page.jsx — server component
import { fetchProducts } from '@/lib/data';
import { ProductsClient } from './products-client';

export default async function ProductsPage() {
  const products = await fetchProducts();
  return <ProductsClient initialItems={products} />;
}
```

```javascript
// app/products/products-client.jsx
'use client';

import { useRef } from 'react';
import { createStore, StoreProvider } from 'easy-peasy';
import { productsModel } from './store-model';
import { ProductsList } from './products-list';

export function ProductsClient({ initialItems }) {
  const storeRef = useRef(null);
  if (storeRef.current === null) {
    storeRef.current = createStore(productsModel, {
      initialState: { items: initialItems },
    });
  }
  return (
    <StoreProvider store={storeRef.current}>
      <ProductsList />
    </StoreProvider>
  );
}
```

Anything passed as a prop from a server component to a client component must
be JSON-serialisable — see [Pitfalls](#pitfalls-and-gotchas) below.

## Pattern 3: read-only store inside a server component

If you want to use your model for derivation only (computed properties,
[`createTransform`](/docs/api/create-transform.html) pipelines, normalising
data) without any React component tree, import from `easy-peasy/server` —
this avoids pulling React into the server bundle.

```javascript
// app/dashboard/page.jsx — server component
import { createStore } from 'easy-peasy/server';
import { dashboardModel } from './model';
import { DashboardView } from './dashboard-view'; // 'use client'

export default async function DashboardPage() {
  const data = await fetchDashboardData();

  // Build a transient store on the server purely for its derivation logic.
  const store = createStore(dashboardModel, { initialState: data });
  const summary = store.getState().summary; // e.g. a computed property

  return <DashboardView summary={summary} />;
}
```

> **Important:** the store created here is local to a single request. It is
> not shared with the client — the client builds its own store under
> `<StoreProvider>` (Pattern 1 or 2).

## Pitfalls and gotchas

### Never share a store at module scope on the server

```javascript
// ❌ BAD — every request shares this single instance
import { createStore } from 'easy-peasy/server';
import { model } from './model';

export const sharedStore = createStore(model);
```

In Node-style SPA apps, a module-scope store is fine. In an RSC / App Router
app the **same module instance is reused across requests and concurrent
users**, which means one user's actions would mutate state visible to
another. Always create the store either:

- inside a client component instance (Pattern 1 / 2), so it is bound to the
  React tree's lifetime, or
- inside a server component function body (Pattern 3), so it is bound to one
  request.

### Hooks live in the client subtree only

`StoreProvider`, `useStoreState`, `useStoreActions`, `useStoreTransition`,
`useStoreRehydrated`, etc. all require React and a Provider. Importing them
from a server component will fail at build/render time. If you need
store/model logic on the server, import from
[`easy-peasy/server`](/docs/api/easy-peasy-server.html) instead.

### Props from server → client must be JSON-serialisable

Anything you hand to a client component as a prop is serialised across the
server/client boundary. `Date`, `Map`, `Set`, `BigInt`, functions, class
instances, and `undefined` values either throw or round-trip incorrectly.

If your model holds non-serialisable values, convert them at the boundary —
for example serialise `Date` as ISO string and revive it inside the client
component, or use a [`createTransform`](/docs/api/create-transform.html)
pipeline if the same conversion is needed for `persist`.

```javascript
// In the server component
return <ProductsClient initialItems={products.map((p) => ({
  ...p,
  createdAt: p.createdAt.toISOString(), // 👈 normalise to a string
}))} />;
```

### Avoid `persist` storage on the server

The default `sessionStorage` / `localStorage` storage engines do not exist on
the server. If your store uses [`persist`](/docs/api/persist.html) and you
build a transient server-side store via `easy-peasy/server`, configure a
no-op or in-memory storage engine for the server case (or skip persistence
entirely on that code path) — otherwise rehydration will throw or hang.

## `useStoreRehydrated` and streaming

The App Router supports streaming via `<Suspense>` boundaries and `loading.tsx`
files. [`useStoreRehydrated`](/docs/api/use-store-rehydrated.html) integrates
with this naturally because it suspends while persisted state is being
rehydrated:

```javascript
// app/(authenticated)/layout.jsx — server component
import { Suspense } from 'react';
import { StoreProvider } from '@/app/store-provider';
import { Shell, Skeleton } from './shell';

export default function Layout({ children }) {
  return (
    <StoreProvider>
      <Suspense fallback={<Skeleton />}>
        <Shell>{children}</Shell>
      </Suspense>
    </StoreProvider>
  );
}
```

```javascript
// app/(authenticated)/shell.jsx
'use client';

import { useStoreRehydrated } from 'easy-peasy';

export function Shell({ children }) {
  useStoreRehydrated(); // suspends until persisted state is loaded
  return <main>{children}</main>;
}
```

Because rehydration only happens on the client, the server rendered HTML will
emit the Suspense fallback. The fallback is replaced once the client store
has read from its (browser-only) storage engine. If you want the server to
render the real shell instead of the fallback for SEO/preview reasons, prefer
Pattern 2 — feed an `initialState` snapshot from the server so the store
boots already populated and `useStoreRehydrated` resolves on the first render.

> **Caveat:** these patterns are validated against the public RSC contract
> and Easy Peasy's own server export, but specific Next.js versions evolve
> their App Router internals quickly. If you hit unexpected behaviour with a
> particular Next.js version, please
> [open an issue](https://github.com/ctrlplusb/easy-peasy/issues) so we can
> capture the workaround here.
