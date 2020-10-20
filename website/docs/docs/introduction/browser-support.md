# Browsers & React Native

Easy Peasy produces multiple bundle types - support for browsers, Common JS, and
ESM.

However, due to our internal usage of [Immer](https://github.com/immerjs/immer)
your code may break on some older browsers (e.g. IE 11) or some older React
Native environments.

Specifically it will break on [environments](https://caniuse.com/?search=proxy)
that don't support
[proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

We provide a solution to this, however, before we present the solution we would
like to describe our motivation for implementing Immer.

- [Why Immer?](#why-immer)
- [Polyfilling Proxy](#polyfilling-proxy)
  - [Create React App IE11 Support Example](#create-react-app-ie11-support-example)
- [Supporting Map or Set within your state](#supporting-map-or-set-within-your-state)

## Why Immer?

Immer powers our mutation based API that is supported within actions.

```javascript
addTodo: action((state, payload) => {
  // Mutating the state directly! 🤯
  //           👇
  state.items.push(payload);
});
```

[Immer](https://github.com/immerjs/immer) converts these mutation operations
into immutable updates against the store.

This allows for a much improved developer experience as having to manage
immutable update operations yourself can become quite complex. For example here
is the same action above written to ensure immutability is met manually.

```javascript
addTodo: action((state, payload) => {
  return {
    ...state,
    items: [...state.items, payload],
  };
});
```

That's just a simple example. More complex/nested updates can get very tricky to
manage.

## Polyfilling Proxy

If you are getting errors on your console - typically error code 19 or 20 from
the Immer package then your execution environment likely does not support
[proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

To patch/polyfill your environment you need to include the following import.

```javascript
import 'easy-peasy/proxy-polyfill';
```

This should typically be done as early as possible within the entry file of your
application.

### Create React App IE11 Support Example

Create React App users will likely need to include a configuration like so,
which includes full IE11 support;

```javascript
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'easy-peasy/proxy-polyfill';
```

Also, don't forget to update your browserslist within your `package.json`.

```diff
   "browserslist": [
+    "ie 11",
     ">0.2%",
     "not dead",
     "not ie <= 10",
     "not op_mini all"
   ]
```

## Supporting Map or Set within your state

In order to utilize `Map` or `Set` within your state you need to include the
following import.

```javascript
import 'easy-peasy/map-set-support';
```

Similarly to the Proxy polyfill you will need to do this as early as possible
within your application entry file.
