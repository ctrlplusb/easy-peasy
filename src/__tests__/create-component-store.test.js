import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { createComponentStore, action, model } from '../index';

const useCounter = createComponentStore(
  model({
    count: 0,
    inc: action(state => {
      state.count += 1;
    }),
  }),
);

function CountDisplay() {
  const [state, actions] = useCounter();
  return (
    <>
      <div data-testid="count">{state.count}</div>
      <button data-testid="button" onClick={actions.inc} type="button">
        +
      </button>
    </>
  );
}

it('used in component', () => {
  // arrange
  const app = <CountDisplay />;

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

it('multiple instances', async () => {
  // arrange
  const app = (
    <>
      <CountDisplay />
      <CountDisplay />
    </>
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
  expect(count[1].firstChild.textContent).toBe('0');

  // act
  fireEvent.click(button[1]);

  // assert
  expect(count[0].firstChild.textContent).toBe('1');
  expect(count[1].firstChild.textContent).toBe('1');
});

it('with initial data', () => {
  // arrange
  // eslint-disable-next-line no-shadow
  const useCounter = createComponentStore(data =>
    model({
      count: data.count || 0,
      inc: action(state => {
        state.count += 1;
      }),
    }),
  );

  // eslint-disable-next-line no-shadow
  function CountDisplay() {
    const [state, actions] = useCounter({ count: 1 });
    return (
      <>
        <div data-testid="count">{state.count}</div>
        <button data-testid="button" onClick={actions.inc} type="button">
          +
        </button>
      </>
    );
  }

  const app = <CountDisplay />;

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
