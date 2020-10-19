# Browsers & React Native

The Easy Peasy package is built to support multiple environments - i.e. Browser/Server/ES5/ESM. However, due to our internal usage of [Immer](https://github.com/immerjs/immer) your code may break on some React Native environments, or on older browsers, such as Internet Explorer.

Specifically it will break on [environments](https://caniuse.com/?search=proxy) that don't directly support [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

There is a solution provided via the Immer library, however, before we present the solution we will provide our motivation behind using Immer in the first place.

- [Why Immer?](#why-immer)
- [Configuring Immer to support ES5](#configuring-immer-to-support-es5)

## Why Immer?

Immer powers our mutation based API that is supported within actions.

```javascript
addTodo: action((state, payload) => {
  // Mutating the state directly! 🤯
  //           👇
  state.items.push(payload);
});
```

[Immer](https://github.com/immerjs/immer) converts these mutation operations into immutable updates against the store.

This allows for a much improved developer experience as having to manage immutable update operations yourself can become quite complex. For example here is the same action above written to ensure immutability is met manually.

```javascript
addTodo: action((state, payload) => {
  return {
    ...state,
    items: [...state.items, payload],
  };
});
```

That's just a simple example. More complex/nested updates can get very tricky to manage.

## Supporting older browsers (IE11)

> **TL;DR**:
> To support older browsers, you need to import polyfills at the start of your app:<br>
> `import 'easy-peasy/polyfill'`

When Immer released version 7 of the library they tried to tackle the growing package size. In order to do so they split out "additional" features into separate imports. For example support for ES5, or for Map/Set support.

So in order to support older browsers, polyfilling immer is required (it is best to add this at the start of your application):

```javascript
import 'easy-peasy/polyfill/patch-immer';
```

In addition to this, if you would like to support mutating of Map/Set based state then you can run the required helper like so.

```javascript
import 'easy-peasy/polyfill/patch-map-set';
```

But in this case, you can simply enable all polyfills:
```javascript
import 'easy-peasy/polyfill';
```
