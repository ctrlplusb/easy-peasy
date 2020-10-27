import { action, createStore } from '../src';

test('deprecated action API does nothing', () => {
  // ACT
  const store = createStore({
    count: 1,
    increment: (state) => {
      state.count += 1;
    },
  });

  // ASSERT
  expect(store.getActions().increment).toBeUndefined();
});

test('returning the state has no effect', () => {
  // ARRANGE
  const store = createStore({
    count: 1,
    doNothing: action((state) => state),
  });
  const prevState = store.getState();

  // ACT
  store.getActions().doNothing();

  // ASSERT
  expect(store.getState()).toBe(prevState);
});
