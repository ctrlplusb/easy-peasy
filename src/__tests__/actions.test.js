import { action, createStore, model } from '../index';

test('deprecated action API does nothing', () => {
  // act
  const store = createStore(
    model({
      count: 1,
      increment: state => {
        state.count += 1;
      },
    }),
  );

  // assert
  expect(store.getActions().increment).toBeUndefined();
});

test('returning the state has no effect', () => {
  // arrange
  const store = createStore(
    model({
      count: 1,
      doNothing: action(state => state),
    }),
  );
  const prevState = store.getState();

  // act
  store.getActions().doNothing();

  // assert
  expect(store.getState()).toBe(prevState);
});
