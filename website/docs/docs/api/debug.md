# debug

This helper is useful in the context of [actions](/docs/api/action.html).

[Actions](/docs/api/action.html) use the [immer](https://github.com/mweststrate/immer) library under the hood in order to convert mutative updates into immutable ones. Therefore if you try to `console.log` your state within an [action](/doc/api/action.html) you will see a `Proxy` object or a `null` is printed.

Use this helper in order to get the actual value of the `state` within your [action](/docs/api/action.html).

_Before:_

```javascript
const model = {
  increment: action((state, payload) => {
    state.count += 1;
    console.log(state); // 👈 prints a Proxy object or a null
  })
}
```

_After:_

```javascript
import { debug } from 'easy-peasy';

const model = {
  increment: action((state, payload) => {
    state.count += 1;
    console.log(debug(state)); // 👈 prints the "native" state representation
  })
}
```

> ***Note:*** *If you have set the `disableImmer` configuration value on the store you will not need to use this helper.*