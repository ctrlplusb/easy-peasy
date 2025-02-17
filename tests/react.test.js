/* eslint-disable no-param-reassign */
/* eslint-disable react/prop-types */

import React, { act } from 'react';
import { render, fireEvent } from '@testing-library/react';

import {
  action,
  createStore,
  StoreProvider,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
} from '../src';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('exposes dispatch', () => {
  // ARRANGE
  const store = createStore({ foo: 'bar' });

  function MyComponent() {
    const dispatch = useStoreDispatch();
    // ASSERT
    expect(dispatch).toBe(store.dispatch);
    return null;
  }

  // ACT
  render(
    <StoreProvider store={store}>
      <MyComponent />
    </StoreProvider>,
  );
});

test('maps state when props change', async () => {
  // ARRANGE
  const store = createStore({
    values: {
      1: 'foo',
      2: 'bar',
    },
  });
  function Values({ id }) {
    const value = useStoreState((state) => state.values[id]);
    return <span data-testid="value">{value}</span>;
  }
  const app = (
    <StoreProvider store={store}>
      <Values id={1} />
    </StoreProvider>
  );

  // ACT
  const { getByTestId, rerender } = render(app);

  // ASSERT
  const value = getByTestId('value');
  expect(value.firstChild.textContent).toBe('foo');

  // ACT
  rerender(
    <StoreProvider store={store}>
      <Values id={2} />
    </StoreProvider>,
  );

  // ASSERT
  expect(value.firstChild.textContent).toBe('bar');
});

test('store subscribe is only called once', () => {
  // ARRANGE
  const store = createStore({
    count: 1,
    inc: action((state) => {
      state.count += 1;
    }),
  });
  jest.spyOn(store, 'subscribe');
  const renderSpy = jest.fn();
  function Counter() {
    const count = useStoreState((state) => state.count);
    renderSpy();
    return <span data-testid="count">{count}</span>;
  }
  const app = (
    <StoreProvider store={store}>
      <Counter />
    </StoreProvider>
  );

  // ACT
  render(app);

  // ASSERT
  expect(renderSpy).toBeCalledTimes(1);
  expect(store.subscribe).toBeCalledTimes(1);

  // ACT
  act(() => {
    store.getActions().inc();
  });

  // ASSERT
  expect(renderSpy).toBeCalledTimes(2);
  expect(store.subscribe).toBeCalledTimes(1);
});

test('store is unsubscribed on unmount', () => {
  // ARRANGE
  const store = createStore({
    count: 1,
    inc: action((state) => {
      state.count += 1;
    }),
  });
  const unsubscribeSpy = jest.fn();
  store.subscribe = () => unsubscribeSpy;
  function Counter() {
    const count = useStoreState((state) => state.count);
    return <span data-testid="count">{count}</span>;
  }
  const app = (
    <StoreProvider store={store}>
      <Counter />
    </StoreProvider>
  );

  // ACT
  const { unmount } = render(app);

  // ASSERT
  expect(unsubscribeSpy).toBeCalledTimes(0);

  // ACT
  store.getActions().inc();

  // ASSERT
  expect(unsubscribeSpy).toBeCalledTimes(0);

  // ACT
  unmount();

  // ASSERT
  expect(unsubscribeSpy).toBeCalledTimes(1);
});

describe('direct form', () => {
  test('component updates with state change', () => {
    // ARRANGE
    const store = createStore({
      count: 1,
      inc: action((state) => {
        state.count += 1;
      }),
    });
    const renderSpy = jest.fn();
    function Counter() {
      const count = useStoreState((state) => state.count);
      const inc = useStoreActions((actions) => actions.inc);
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

    // ACT
    const { getByTestId } = render(app);

    // ASSERT
    const countButton = getByTestId('count');
    expect(countButton.firstChild.textContent).toBe('1');
    expect(renderSpy).toHaveBeenCalledTimes(1);

    // ACT
    fireEvent.click(countButton);

    // ASSERT
    expect(countButton.firstChild.textContent).toBe('2');
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });

  test('component only updates with state change', () => {
    // ARRANGE
    const store = createStore({
      count: 1,
      somethingElse: null,
      updateSomethingElse: action((state, payload) => {
        state.somethingElse = payload;
      }),
    });
    const renderSpy = jest.fn();
    function Counter() {
      const count = useStoreState((state) => state.count);
      renderSpy();
      return <span data-testid="count">{count}</span>;
    }
    const app = (
      <StoreProvider store={store}>
        <Counter />
      </StoreProvider>
    );

    // ACT
    const { getByTestId } = render(app);

    // ASSERT
    const countButton = getByTestId('count');
    expect(countButton.firstChild.textContent).toBe('1');
    expect(renderSpy).toHaveBeenCalledTimes(1);

    // ACT
    store.getActions().updateSomethingElse('foo');

    // ASSERT
    expect(countButton.firstChild.textContent).toBe('1');
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});
