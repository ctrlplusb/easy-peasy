import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { useLocalStore, action } from '../index';

function CountDisplay() {
  const [state, actions] = useLocalStore(() => ({
    count: 0,
    inc: action(s => {
      s.count += 1;
    }),
  }));
  return (
    <>
      <div data-testid="count">{state.count}</div>
      <button data-testid="button" onClick={actions.inc} type="button">
        +
      </button>
    </>
  );
}

test('used in component', () => {
  // arrange
  const app = <CountDisplay />;

  // act
  const { getByTestId } = render(app);

  const count = getByTestId('count');
  const button = getByTestId('button');

  // assert
  expect(count.textContent).toBe('0');

  // act
  fireEvent.click(button);

  // assert
  expect(count.textContent).toBe('1');
});

test('multiple instances', async () => {
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
  expect(count[0].textContent).toBe('0');
  expect(count[1].textContent).toBe('0');

  // act
  fireEvent.click(button[0]);

  // assert
  expect(count[0].textContent).toBe('1');
  expect(count[1].textContent).toBe('0');

  // act
  fireEvent.click(button[1]);

  // assert
  expect(count[0].textContent).toBe('1');
  expect(count[1].textContent).toBe('1');
});

test('with external data', () => {
  // arrange

  // eslint-disable-next-line no-shadow,react/prop-types
  function CountDisplay({ count }) {
    const [state, actions] = useLocalStore(
      () => ({
        count,
        inc: action(_state => {
          _state.count += 1;
        }),
      }),
      [count],
    );
    return (
      <>
        <div data-testid="count">{state.count}</div>
        <button data-testid="button" onClick={actions.inc} type="button">
          +
        </button>
      </>
    );
  }

  const app = <CountDisplay count={1} />;

  // act
  const { getByTestId } = render(app);

  const count = getByTestId('count');
  const button = getByTestId('button');

  // assert
  expect(count.textContent).toBe('1');

  // act
  fireEvent.click(button);

  // assert
  expect(count.textContent).toBe('2');
});

test('with config', () => {
  // ACT
  const logs = [];

  const customMiddleware = () => next => _action => {
    // assert
    logs.push(_action.type);
    next(_action);
  };

  // eslint-disable-next-line no-shadow,react/prop-types
  function CountDisplay({ count }) {
    const [state, actions] = useLocalStore(
      () => ({
        count,
        inc: action(_state => {
          _state.count += 1;
        }),
      }),
      [count],
      {
        middleware: [customMiddleware],
      },
    );
    return (
      <>
        <div data-testid="count">{state.count}</div>
        <button data-testid="button" onClick={actions.inc} type="button">
          +
        </button>
      </>
    );
  }

  const app = <CountDisplay count={1} />;

  const { getByTestId } = render(app);

  const button = getByTestId('button');
  fireEvent.click(button);

  // ASSERT
  expect(logs).toEqual(['@action.inc']);
});

test('returns the store', () => {
  // ARRANGE
  let actualStore;

  // eslint-disable-next-line no-shadow
  function CountDisplay() {
    const [, , store] = useLocalStore(() => ({
      count: 0,
    }));
    actualStore = store;
    return null;
  }

  // ACT
  const app = <CountDisplay count={1} />;

  render(app);

  // EXPECT
  expect(actualStore).not.toBeUndefined();
  expect(actualStore.getState()).toEqual({ count: 0 });
});
