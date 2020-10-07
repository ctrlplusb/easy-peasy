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

## Configuring Immer to support ES5

When Immer released version 7 of the library they tried to tackle the growing package size. In order to do so they split out "additional" features into separate imports. For example support for ES5, or for Map/Set support.

We have decided to not include these features by default, so if you are in need of supporting older browsers or React Native environments then you need to explicity import the `enableES5` helper from Immer.

```javascript
import { enableES5 } from 'immer';

enableES5();
```

In addition to this, if you would like to support mutating of Map/Set based state then you can run the required helper like so.

```javascript
import { enableMapSet } from 'immer';

enableMapSet();
```

It is best to do this at the start of your application.
