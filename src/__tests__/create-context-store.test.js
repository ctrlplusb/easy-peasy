/* eslint-disable no-shadow */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { createContextStore, action } from '../index';

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
