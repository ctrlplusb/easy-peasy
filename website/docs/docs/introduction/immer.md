# Immer

Easy Peasy uses [`immer`](https://github.com/immerjs/immer) under the hood to power the mutation based API within actions.

```javascript
addTodo: action((state, payload) => {
  //           👇 thank you immer
  state.items.push(payload);
});
```

`immer` allows us to convert these mutations into immutable update operations against the store.

Unfortunately `immer`, by default, does not support [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) properties. This is an issue for us as Easy Peasy makes use of getters to support the [computed](/api/docs/computed) API.

To workaround this restriction we previously resorted to maintaining a forked version of `immer` (published as `immer-peasy`), with the fork allowing the use of getters. With the ever increasing popularity of `immer` we decided that this strategy isn't ideal as there is a good chance applications may want to make use of `immer` directly. This would have meant that consumers would have to install our forked version of `immer` in order to avoid having duplicate dependencies within their application (i.e. having both `immer` and `immer-peasy` bundled).

Therefore our most recent strategy is to depend on native `immer`, but patch it via the [`patch-package`](https://github.com/ds300/patch-package) library in order to support getter properties. The patching process occurs via the `postinstall` script that is defined within our `package.json`.

This strategy allows you to import and use `immer` directly within your application should you need to.

That being said, there are some points to take into consideration given that we have patched `immer`;

1. `immer` should work exactly as you would expect as long as the object instances you operate against do not contain getter properties. The default `immer` behaviour would have caused an exception to be thrown in these cases. Our patched version would not cause an exception, instead any getter properties would become `undefined`.
2. Given we are patching `immer` we have had to install a specific version of `immer` (specifically `immer@6.0.1`). If we didn't do so then our patch may not be applied correctly due to file changes that may have occurred between versions. We strongly suggest you add this same version of `immer` as a dependency to your application in order to avoid having multiple `immer` installations bundled within your application.
