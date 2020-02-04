import { createStore } from '../src';

test('redux dev tools disabled', () => {
  // ARRANGE
  const model = { foo: 'bar' };
  const composeStub = jest.fn();
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = jest.fn(() => composeStub);

  // ACT
  createStore(model, {
    devTools: false,
  });

  // ASSERT
  expect(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__).not.toHaveBeenCalled();
});

test('redux dev tools enabled by default', () => {
  // ARRANGE
  const model = { foo: 'bar' };
  const composeStub = jest.fn();
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = jest.fn(() => composeStub);

  // ACT
  createStore(model);

  // ASSERT
  expect(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__).toHaveBeenCalledTimes(1);
  expect(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__).toHaveBeenCalledWith({
    name: 'EasyPeasyStore',
    trace: false,
    traceLimit: 25,
  });
  expect(composeStub).toHaveBeenCalledTimes(1);
});

test('redux dev tools supports custom store name', () => {
  // ARRANGE
  const model = { foo: 'bar' };
  const composeStub = jest.fn();
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = jest.fn(() => composeStub);

  // ACT
  createStore(model, {
    name: 'SwizzleSticks',
  });

  // ASSERT
  expect(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__).toHaveBeenCalledTimes(1);
  expect(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__).toHaveBeenCalledWith({
    name: 'SwizzleSticks',
    trace: false,
    traceLimit: 25,
  });
  expect(composeStub).toHaveBeenCalledTimes(1);
});

test('redux dev tools supports enabling debug trace', () => {
  // arrange
  const model = { foo: 'bar' };
  const composeStub = jest.fn();
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = jest.fn(() => composeStub);

  // act
  createStore(model, {
    trace: true,
  });

  // assert
  expect(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__).toHaveBeenCalledTimes(1);
  expect(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__).toHaveBeenCalledWith({
    name: 'EasyPeasyStore',
    trace: true,
    traceLimit: 25,
  });
  expect(composeStub).toHaveBeenCalledTimes(1);
});
