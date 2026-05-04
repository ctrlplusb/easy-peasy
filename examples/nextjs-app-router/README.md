# Easy Peasy v7 — Next.js App Router (RSC) example

Demonstrates how to use Easy Peasy v7 alongside React Server Components and
the Next.js App Router, exercising the new
[`easy-peasy/server`](../../website/docs/docs/api/easy-peasy-server.md) subpath.

What it shows:

- The shared model (`lib/model.ts`) lives outside the React tree and is
  imported from both the server page and the client component.
- `app/page.tsx` is a server component. It builds a transient store via
  `easy-peasy/server` purely to derive the products' `totalValue` computed
  property server-side — no React, no provider, no hydration of that store.
- `app/products-client.tsx` is the `'use client'` boundary. It creates the
  *real* interactive store in a `useRef` and wraps its children in
  `StoreProvider`. The server-fetched products are passed in as
  `initialState`.
- `app/products-view.tsx` is a client component that consumes the store via
  the typed hooks (`useStoreState`, `useStoreActions`).

This pattern matches Pattern 2 + Pattern 3 from the
[RSC / App Router recipe](../../website/docs/docs/recipes/usage-with-rsc-and-next-app-router.md).

## Run

```sh
yarn install
yarn dev
```

Then open <http://localhost:3000>.
