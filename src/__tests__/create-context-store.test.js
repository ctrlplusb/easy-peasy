/* eslint-disable no-shadow */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { createContextStore, action, thunk, actionOn } from '../index';

const Counter = createContextStore({
  count: 0,
  inc: action(state => {
    state.count += 1;
  }),
});

function CountDisplayUseStore() {
  const store = Counter.useStore();
  return (
    <>
      <div data-testid="count">{store.getState().count}</div>
    </>
  );
}

function CountDisplay() {
  const count = Counter.useStoreState(state => state.count);
  const inc = Counter.useStoreActions(actions => actions.inc);
  return (
    <>
      <div data-testid="count">{count}</div>
      <button data-testid="button" onClick={inc} type="button">
        +
      </button>
    </>
  );
}

it('single consumer', () => {
  // arrange
  const app = (
    <Counter.Provider>
      <CountDisplay />
    </Counter.Provider>
  );

  // act
  const { getByTestId } = render(app);

  const count = getByTestId('count');
  const button = getByTestId('button');

  // assert
  expect(count.firstChild.textContent).toBe('0');

  // act
  fireEvent.click(button);

  // assert
  expect(count.firstChild.textContent).toBe('1');
});

it('multiple consumers', async () => {
  // arrange
  const app = (
    <Counter.Provider>
      <CountDisplay />
      <CountDisplay />
    </Counter.Provider>
  );

  // act
  const { findAllByTestId } = render(app);

  const count = await findAllByTestId('count');
  const button = await findAllByTestId('button');

  // assert
  expect(count[0].firstChild.textContent).toBe('0');
  expect(count[1].firstChild.textContent).toBe('0');

  // act
  fireEvent.click(button[0]);

  // assert
  expect(count[0].firstChild.textContent).toBe('1');
  expect(count[1].firstChild.textContent).toBe('1');
});

it('useStore hook', () => {
  // arrange
  const app = (
    <Counter.Provider>
      <CountDisplayUseStore />
    </Counter.Provider>
  );

  // act
  const { getByTestId } = render(app);
  const count = getByTestId('count');

  // assert
  expect(count.firstChild.textContent).toBe('0');
});

it('with initial data', () => {
  // arrange
  const Counter = createContextStore(data => ({
    count: data.count || 0,
    inc: action(state => {
      state.count += 1;
    }),
  }));

  function CountDisplay() {
    const count = Counter.useStoreState(state => state.count);
    const inc = Counter.useStoreActions(actions => actions.inc);
    return (
      <>
        <div data-testid="count">{count}</div>
        <button data-testid="button" onClick={inc} type="button">
          +
        </button>
      </>
    );
  }

  const app = (
    <Counter.Provider initialData={{ count: 1 }}>
      <CountDisplay />
    </Counter.Provider>
  );

  // act
  const { getByTestId } = render(app);

  const count = getByTestId('count');
  const button = getByTestId('button');

  // assert
  expect(count.firstChild.textContent).toBe('1');

  // act
  fireEvent.click(button);

  // assert
  expect(count.firstChild.textContent).toBe('2');
});

it('with runtime injection', () => {
  // arrange
  const Counter = createContextStore(data => ({
    count: data.count || 0,
    getNext: thunk((actions, payload, { getState, injections }) =>
      injections.next(getState().count),
    ),
    onNext: actionOn(
      actions => actions.getNext.successType,
      (state, { result }) => {
        state.count = result;
      },
    ),
  }));

  function CountDisplay() {
    const count = Counter.useStoreState(state => state.count);
    const getNext = Counter.useStoreActions(actions => actions.getNext);
    return (
      <>
        <div data-testid="count">{count}</div>
        <button data-testid="button" onClick={getNext} type="button">
          fetch next
        </button>
      </>
    );
  }

  const multiplier = value => value * 2;

  const app = (
    <Counter.Provider
      initialData={{ count: 4 }}
      config={{ injections: { next: multiplier } }}
    >
      <CountDisplay />
    </Counter.Provider>
  );

  // act
  const { getByTestId } = render(app);

  const count = getByTestId('count');
  const button = getByTestId('button');

  // assert
  expect(count.firstChild.textContent).toBe('4');

  // act
  fireEvent.click(button);

  // assert
  expect(count.firstChild.textContent).toBe('8');
});

it('with state preservation when updating runtime injection', () => {
  // arrange
  const Counter = createContextStore(data => ({
    count: data.count || 0,
    getNext: thunk((actions, payload, { getState, injections }) =>
      injections.next(getState().count),
    ),
    onNext: actionOn(
      actions => actions.getNext.successType,
      (state, { result }) => {
        state.count = result;
      },
    ),
  }));

  function CountDisplay() {
    const count = Counter.useStoreState(state => state.count);
    const getNext = Counter.useStoreActions(actions => actions.getNext);

    return (
      <>
        <div data-testid="count">{count}</div>
        <button data-testid="button" onClick={getNext} type="button">
          fetch next
        </button>
      </>
    );
  }

  const getComponent = next => (
    <Counter.Provider
      initialData={{ count: 4 }}
      config={{ injections: { next } }}
    >
      <CountDisplay />
    </Counter.Provider>
  );

  const multiplier = value => value * 2;

  // act
  const { getByTestId, rerender } = render(getComponent(multiplier));

  const count = getByTestId('count');
  const button = getByTestId('button');

  expect(count.firstChild.textContent).toBe('4');

  fireEvent.click(button);

  expect(count.firstChild.textContent).toBe('8');

  const plusOne = value => value + 1;

  rerender(getComponent(plusOne));
  fireEvent.click(button);

  expect(count.firstChild.textContent).toBe('9');
});
