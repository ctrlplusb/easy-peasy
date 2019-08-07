# Testing actions

[Actions](/docs/api/actions.html) are relatively simple to test as they are essentially an immutable update to the [store](/docs/api/store.html). We can therefore compare the prev and updated state to assert that our actions have had the effect against our store's state.

## Example

Given the following model under test.

```typescript
import { action } from 'easy-peasy'

const todosModel = {
  items: {},
  add: action((state, payload) => {
    state.items[payload.id] = payload
  })
};
```

We could test it like so.

```typescript
test('add todo action', async () => {
  // arrange
  const todo = { id: 1, text: 'foo' };
  const store = createStore(todosModel);

  // act
  store.getActions().add(todo);

  // assert
  expect(store.getState().items).toEqual({ [todo.id]: todo });
});
```
