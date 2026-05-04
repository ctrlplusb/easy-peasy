# Browsers & React Native

Easy Peasy ships ESM and CommonJS bundles. The library targets the same
environments that React 19 supports — modern evergreen browsers and current
React Native runtimes.

- [Why Immer?](#why-immer)
- [Proxy is required](#proxy-is-required)
- [Supporting Map or Set within your state](#supporting-map-or-set-within-your-state)

## Why Immer?

Easy Peasy uses [Immer](https://github.com/immerjs/immer) to power the
mutation-based API supported within actions:

```javascript
addTodo: action((state, payload) => {
  // Mutating the state directly! 🤯
  //           👇
  state.items.push(payload);
});
```

Immer converts these mutation operations into immutable updates against the
store. This is a much improved developer experience over managing immutable
updates yourself, particularly for deeply nested state. The same action
without Immer would look like:

```javascript
addTodo: action((state, payload) => {
  return {
    ...state,
    items: [...state.items, payload],
  };
});
```

## Proxy is required

Immer relies on the
[`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
global. Every browser in React 19's
[supported list](https://react.dev/reference/react/version-history) ships
native `Proxy`, as do all current React Native runtimes (Hermes, JSC), so no
polyfill is required.

> **Migrating from v6?** Easy Peasy v6 shipped an `easy-peasy/proxy-polyfill`
> subpath that opted Immer into an ES5 fallback for environments without
> native `Proxy` (notably IE11). v7 upgrades to Immer v11, which removed ES5
> mode entirely, so the subpath has been deleted. Remove any
> `import 'easy-peasy/proxy-polyfill';` lines — see the
> [v6 → v7 upgrade guide](/docs/upgrading-from-v6/#easy-peasyproxy-polyfill-subpath-removed)
> for details.

## Supporting Map or Set within your state

To use `Map` or `Set` within your state you need to opt into Immer's
[Map/Set support](https://immerjs.github.io/immer/map-set/) by importing the
following module as early as possible in your application's entry file:

```javascript
import 'easy-peasy/map-set-support';
```
