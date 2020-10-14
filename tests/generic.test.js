import { createStore, generic } from '../src';

test('generic values are passed through as state', () => {
  // ACT
  const store = createStore({
    foo: generic(1337),
  });

  // ASSERT
  expect(store.getState()).toEqual({
    foo: 1337,
  });
});
