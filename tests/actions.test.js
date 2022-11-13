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

describe('disabling immer via actions config', () => {

  test('not returning the state in action makes state undefined', () => {
    // ARRANGE
    const store = createStore({
      count: 1,
      addOne: action((state) => {
        state.count += 1;
      }, { immer: false }),
    });

    // ACT
    store.getActions().addOne();

    // ASSERT
    expect(store.getState()).toBeUndefined();
  });

  test('returning the state in action works', () => {
    // ARRANGE
    const store = createStore({
      count: 1,
      addOne: action((state) => {
        state.count += 1;
        return state;
      }, { immer: false }),
    });

    // ACT
    store.getActions().addOne();

    // ASSERT
    expect(store.getState()).toEqual({count: 2});
  });

  test('explicitly enabling immer in action works without returning state', () => {
    // ARRANGE
    const store = createStore({
      count: 1,
      addOne: action((state) => {
        state.count += 1;
      }, { immer: true }),
    });

    // ACT
    store.getActions().addOne();

    // ASSERT
    expect(store.getState()).toEqual({count: 2});
  });

});

