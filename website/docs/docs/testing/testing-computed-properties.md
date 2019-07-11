# Testing computed properties

Computed properties are simply the result of a derive process applied to existing state. Therefore one strategy would be to create versions of your store with the `initialState` defined. You could then verify that the expected values are derived by your computed properties.

## Example

Given the following model under test.

```typescript
import { computed } from 'easy-peasy'

const todosModel = {
  items: {},
  count: computed(state => Object.keys(state.items).length)
}
```

We could test it like so.

```typescript
test('"count" is 0 when there are no items', async () => {
  // act
  const store = createStore(todosModel);

  // assert
  expect(store.getState().count).toEqual(0);
});
```

## Utilising initialState

You can also utilise the `initialState` configuration property of stores in order to preload some initial state, which would allow you to wider testing of your computed properties.

```javascript
test('"count" is 2 when there are 2 items', async () => {
  // act
  const store = createStore(todosModel, {
    // utilise initialState to preload our state
    initialState: {
      items: {
        1: 'foo',
        2: 'bar'
      }
    }
  });

  // assert
  expect(store.getState().count).toEqual(2);
});
```
