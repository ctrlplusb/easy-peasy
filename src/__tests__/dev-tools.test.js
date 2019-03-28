import { createStore } from '../index';

test('redux dev tools disabled', () => {
  // arrange
  const model = { foo: 'bar' };
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = jest.fn();
  // act
  createStore(model, {
    devTools: false,
  });
  // assert
  expect(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__).not.toHaveBeenCalled();
});

test('redux dev tools enabled by default', () => {
  // arrange
  const model = { foo: 'bar' };
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = jest.fn();
  // act
  createStore(model);
  // assert
  expect(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__).toHaveBeenCalledTimes(1);
});
