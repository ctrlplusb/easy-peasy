import { action, createStore, model, reducer } from '../index';

it('basic', () => {
  // arrange
  const store = createStore(
    model({
      counter: reducer((state = 1, _action) => {
        if (_action.type === 'INCREMENT') {
          return state + 1;
        }
        return state;
      }),
      foo: model({
        bar: 'baz',
        update: action(state => {
          state.bar = 'bob';
        }),
      }),
    }),
  );

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
  const store = createStore(
    model({
      stuff: model({
        counter: reducer((state = 1, _action) => {
          if (_action.type === 'INCREMENT') {
            return state + 1;
          }
          return state;
        }),
      }),
    }),
  );

  // act
  store.dispatch({ type: 'INCREMENT' });

  // assert
  expect(store.getState()).toEqual({
    stuff: {
      counter: 2,
    },
  });
});
