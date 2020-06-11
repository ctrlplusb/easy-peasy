# Immer

Easy Peasy uses [`immer`](https://github.com/immerjs/immer) under the hood to power the mutation based API within actions.

```javascript
addTodo: action((state, payload) => {
  //           👇 thank you immer
  state.items.push(payload);
});
```

`immer` allows us to convert these mutations into immutable update operations against the store.

> Coming soon, more notes and recommendations...
