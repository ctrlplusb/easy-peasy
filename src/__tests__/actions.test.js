import { createStore } from '../index';

test('deprecated action API does nothing', () => {
  // act
  const store = createStore({
    count: 1,
    increment: state => {
      state.count += 1;
    },
  });

  // assert
  expect(store.getActions().increment).toBeUndefined();
});
