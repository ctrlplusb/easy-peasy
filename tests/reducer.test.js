import { action, createStore, reducer } from '../src';

it('basic', () => {
  // arrange
  const store = createStore({
    counter: reducer((state = 1, _action) => {
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

  // assert
  expect(store.getState().counter).toEqual(1);

  // act
  store.dispatch({ type: 'INCREMENT' });

  // assert
  expect(store.getState()).toEqual({
    counter: 2,
    foo: {
      bar: 'baz',
    },
  });
});

it('nested', () => {
  // arrange
  const store = createStore({
    stuff: {
      counter: reducer((state = 1, _action) => {
        if (_action.type === 'INCREMENT') {
          return state + 1;
        }
        return state;
      }),
    },
  });

  // act
  store.dispatch({ type: 'INCREMENT' });

  // assert
  expect(store.getState()).toEqual({
    stuff: {
      counter: 2,
    },
  });
});
