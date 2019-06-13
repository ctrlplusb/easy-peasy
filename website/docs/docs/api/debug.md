# debug

This helper is useful in the context of [actions](/docs/api/action). [Actions](/docs/api/action) use the [immer](https://github.com/mweststrate/immer) library under the hood in order to convert mutative updates into immutable ones. Therefore if you try to `console.log` your state within an [action](/doc/api/action) you will see wrapping `Proxy` objects printed out.

Use this helper in order to convert your `state` into its native representation.

Before:

```javascript
const model = {
  myAction: action((state, payload) => {
    console.log(state); // 👈 prints a Proxy object
  })
}
```

After:

```javascript
import { debug } from 'easy-peasy';

const model = {
  myAction: action((state, payload) => {
    console.log(debug(state)); // 👈 prints the "native" state representation
  })
}
```