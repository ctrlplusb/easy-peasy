# debug

This helper is useful in the context of [actions](/docs/api/action.html). 

[Actions](/docs/api/action.html) use the [immer](https://github.com/mweststrate/immer) library under the hood in order to convert mutative updates into immutable ones. Therefore if you try to `console.log` your state within an [action](/doc/api/action.html) you will see wrapping `Proxy` objects printed out.

Use this helper in order to get the _original_ `state` value that was provided to your [action](/docs/api/action.html) in its native representation.

_Before:_

```javascript
const model = {
  increment: action((state, payload) => {
    console.log(state); // 👈 prints a Proxy object
    state.count += 1;
  })
}
```

_After:_

```javascript
import { debug } from 'easy-peasy';

const model = {
  increment: action((state, payload) => {
    console.log(debug(state)); // 👈 prints the "native" state representation
    state.count += 1;
  })
}
```

> **Note:** this helper will only return the *original* state that was provided to your action. Any mutations that are applied to the state within your action will not be represented.

> If you have set the `disableImmer` configuration value on the store you will not need to use this helper.