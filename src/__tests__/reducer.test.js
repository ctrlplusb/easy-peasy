import { action, createStore, reducer, select } from '../index';

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
      update: action(state => {
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

it('with selector', () => {
  // arrange
  const store = createStore({
    products: reducer((state = [], { type, payload }) => {
      if (type === 'ADD_PRODUCT') {
        return [...state, payload];
      }
      return state;
    }),
    totalPrice: select(state =>
      state.products.reduce((acc, cur) => acc + cur.price, 0),
    ),
  });

  // act
  store.dispatch({
    type: 'ADD_PRODUCT',
    payload: { name: 'Boots', price: 10 },
  });

  // assert
  expect(store.getState()).toEqual({
    products: [{ name: 'Boots', price: 10 }],
    totalPrice: 10,
  });
});
