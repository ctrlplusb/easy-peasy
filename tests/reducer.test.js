import { action, createStore, reducer } from '../src';

it('basic', () => {
  // ARRANGE
  const store = createStore({
    counter: reducer((state = 1, _action = {}) => {
      if (_action.type === 'INCREMENT') {
        return state + 1;
      }
      return state;
    }),
    foo: {
      bar: 'baz',
      update: action((state) => {
        state.bar = 'bob';
      }),
    },
  });

  // ASSERT
  expect(store.getState().counter).toEqual(1);

  // ACT
  store.dispatch({ type: 'INCREMENT' });

  // ASSERT
  expect(store.getState()).toEqual({
    counter: 2,
    foo: {
      bar: 'baz',
    },
  });
});

it('nested', () => {
  // ARRANGE
  const store = createStore({
    stuff: {
      counter: reducer((state = 1, _action = {}) => {
        if (_action.type === 'INCREMENT') {
          return state + 1;
        }
        return state;
      }),
    },
  });

  // ACT
  store.dispatch({ type: 'INCREMENT' });

  // ASSERT
  expect(store.getState()).toEqual({
    stuff: {
      counter: 2,
    },
  });
});

it('no-op', () => {
  // ARRANGE
  const store = createStore({
    counter: reducer((state = 1, _action = {}) => {
      if (_action.type === 'INCREMENT') {
        return state + 1;
      }
      return state;
    }),
    doNothing: action((state) => state),
  });

  const initial = store.getState();

  // ACT
  store.getActions().doNothing();

  // ASSERT
  expect(store.getState()).toBe(initial);
});
