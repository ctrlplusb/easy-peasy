# Simple todo example with Next.js

This is a [Next.js](https://nextjs.org/) example bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

This is a clone of [`simple-todo`](../simple-todo/), modified to be compatible with Next.js.

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

The `easy-peasy` store & models are located in the `store` folder. All pages (in this example, just `index.tsx`)
are setup to use `easy-peasy` via the `pages/_app.tsx`, which wraps all page components with the `<StoreProvider>`.