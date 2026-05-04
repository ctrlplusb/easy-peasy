# Installation

Firstly, you'll need to make sure that you have React and React DOM installed.
Easy Peasy v7 requires React 19 or later — it relies on `useSyncExternalStore`,
`useTransition`, `useDeferredValue`, `useOptimistic`, `use`, and Suspense
integration provided by React 19.

```bash
npm install react
npm install react-dom
```

Then install Easy Peasy. While v7 is in beta it is published under the `beta`
dist-tag, so install it explicitly:

```bash
npm install easy-peasy@beta
```

The `latest` tag will move to v7 once the stable release ships, at which point
`npm install easy-peasy` will pick up v7 by default.

> If you are still on React 18, stay on `easy-peasy@^6` — see the
> [v6 → v7 migration guide](/docs/upgrading-from-v6/) for details on upgrading.

We're off to the races!
