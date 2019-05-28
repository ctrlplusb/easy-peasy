import React from 'react';
import { render, fireEvent } from 'react-testing-library';
import { createContainerStore, action } from '../index';

const Counter = createContainerStore({
  count: 0,
  inc: action(state => {
    state.count += 1;
  }),
});

function CountDisplayUseStore() {
  const [state, actions] = Counter.useStore();
  return (
    <>
      <div data-testid="count">{state.count}</div>
      <button data-testid="button" onClick={actions.inc} type="button">
        +
      </button>
    </>
  );
}

function CountDisplay() {
  const count = Counter.useState(state => state.count);
  const inc = Counter.useActions(actions => actions.inc);
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
  const button = getByTestId('button');

  // assert
  expect(count.firstChild.textContent).toBe('0');

  // act
  fireEvent.click(button);

  // assert
  expect(count.firstChild.textContent).toBe('1');
});
