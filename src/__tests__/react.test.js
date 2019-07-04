/* eslint-disable no-param-reassign */
/* eslint-disable react/prop-types */

import React from 'react';
import { act } from 'react-dom/test-utils';
import { render, fireEvent } from '@testing-library/react';

import {
  action,
  createStore,
  StoreProvider,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
} from '../index';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('exposes dispatch', () => {
  // arrange
  const store = createStore({ foo: 'bar' });

  function MyComponent() {
    const dispatch = useStoreDispatch();
    // assert
    expect(dispatch).toBe(store.dispatch);
    return null;
  }

  // act
  render(
    <StoreProvider store={store}>
      <MyComponent />
    </StoreProvider>,
  );
});

test('maps state when prop dependency changes', async () => {
  // arrange
  const store = createStore({
    values: {
      1: 'foo',
      2: 'bar',
    },
  });
  function Values({ id }) {
    const value = useStoreState(state => state.values[id], [id]);
    return <span data-testid="value">{value}</span>;
  }
  const app = (
    <StoreProvider store={store}>
      <Values id={1} />
    </StoreProvider>
  );

  // act
  const { getByTestId, rerender } = render(app);

  // assert
  const value = getByTestId('value');
  expect(value.firstChild.textContent).toBe('foo');

  // act
  rerender(
    <StoreProvider store={store}>
      <Values id={2} />
    </StoreProvider>,
  );

  // assert
  expect(value.firstChild.textContent).toBe('bar');
});

test('store subscribe is only called once', () => {
  // arrange
  const store = createStore({
    count: 1,
    inc: action(state => {
      state.count += 1;
    }),
  });
  jest.spyOn(store, 'subscribe');
  const renderSpy = jest.fn();
  function Counter() {
    const count = useStoreState(state => state.count);
    renderSpy();
    return <span data-testid="count">{count}</span>;
  }
  const app = (
    <StoreProvider store={store}>
      <Counter />
    </StoreProvider>
  );

  // act
  render(app);

  // assert
  expect(renderSpy).toBeCalledTimes(1);
  expect(store.subscribe).toBeCalledTimes(1);

  // act
  act(() => {
    store.getActions().inc();
  });

  // assert
  expect(renderSpy).toBeCalledTimes(2);
  expect(store.subscribe).toBeCalledTimes(1);
});

test('store is unsubscribed on unmount', () => {
  // arrange
  const store = createStore({
    count: 1,
    inc: action(state => {
      state.count += 1;
    }),
  });
  const unsubscribeSpy = jest.fn();
  store.subscribe = () => unsubscribeSpy;
  function Counter() {
    const count = useStoreState(state => state.count);
    return <span data-testid="count">{count}</span>;
  }
  const app = (
    <StoreProvider store={store}>
      <Counter />
    </StoreProvider>
  );

  // act
  const { unmount } = render(app);

  // assert
  expect(unsubscribeSpy).toBeCalledTimes(0);

  // act
  store.getActions().inc();

  // assert
  expect(unsubscribeSpy).toBeCalledTimes(0);

  // act
  unmount();

  // assert
  expect(unsubscribeSpy).toBeCalledTimes(1);
});

describe('direct form', () => {
  test('component updates with state change', () => {
    // arrange
    const store = createStore({
      count: 1,
      inc: action(state => {
        state.count += 1;
      }),
    });
    const renderSpy = jest.fn();
    function Counter() {
      const count = useStoreState(state => state.count);
      const inc = useStoreActions(actions => actions.inc);
      renderSpy();
      return (
        <button data-testid="count" type="button" onClick={inc}>
          {count}
        </button>
      );
    }

    const app = (
      <StoreProvider store={store}>
        <Counter />
      </StoreProvider>
    );

    // act
    const { getByTestId } = render(app);

    // assert
    const countButton = getByTestId('count');
    expect(countButton.firstChild.textContent).toBe('1');
    expect(renderSpy).toHaveBeenCalledTimes(1);

    // act
    fireEvent.click(countButton);

    // assert
    expect(countButton.firstChild.textContent).toBe('2');
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });

  test('component only updates with state change', () => {
    // arrange
    const store = createStore({
      count: 1,
      somethingElse: null,
      updateSomethingElse: action((state, payload) => {
        state.somethingElse = payload;
      }),
    });
    const renderSpy = jest.fn();
    function Counter() {
      const count = useStoreState(state => state.count);
      renderSpy();
      return <span data-testid="count">{count}</span>;
    }
    const app = (
      <StoreProvider store={store}>
        <Counter />
      </StoreProvider>
    );

    // act
    const { getByTestId } = render(app);

    // assert
    const countButton = getByTestId('count');
    expect(countButton.firstChild.textContent).toBe('1');
    expect(renderSpy).toHaveBeenCalledTimes(1);

    // act
    store.getActions().updateSomethingElse('foo');

    // assert
    expect(countButton.firstChild.textContent).toBe('1');
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});

test('issue230', () => {
  // arrange
  const renderSpy = jest.fn();

  // act

  // assert
});
