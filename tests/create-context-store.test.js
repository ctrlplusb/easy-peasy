import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { createContextStore, action, thunk } from '../src';

const Counter = createContextStore({
  count: 0,
  inc: action((state) => {
    state.count += 1;
  }),
});

function CountDisplayUseStore() {
  const store = Counter.useStore();
  return <div data-testid="count">{store.getState().count}</div>;
}

function CountDisplay() {
  const count = Counter.useStoreState((state) => state.count);
  const inc = Counter.useStoreActions((actions) => actions.inc);
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
  // ARRANGE
  const app = (
    <Counter.Provider>
      <CountDisplay />
    </Counter.Provider>
  );

  // ACT
  const { getByTestId } = render(app);

  const count = getByTestId('count');
  const button = getByTestId('button');

  // ASSERT
  expect(count.firstChild.textContent).toBe('0');

  // ACT
  fireEvent.click(button);

  // ASSERT
  expect(count.firstChild.textContent).toBe('1');
});

it('multiple consumers', async () => {
  // ARRANGE
  const app = (
    <Counter.Provider>
      <CountDisplay />
      <CountDisplay />
    </Counter.Provider>
  );

  // ACT
  const { findAllByTestId } = render(app);

  const count = await findAllByTestId('count');
  const button = await findAllByTestId('button');

  // ASSERT
  expect(count[0].firstChild.textContent).toBe('0');
  expect(count[1].firstChild.textContent).toBe('0');

  // ACT
  fireEvent.click(button[0]);

  // ASSERT
  expect(count[0].firstChild.textContent).toBe('1');
  expect(count[1].firstChild.textContent).toBe('1');
});

it('useStore hook', () => {
  // ARRANGE
  const app = (
    <Counter.Provider>
      <CountDisplayUseStore />
    </Counter.Provider>
  );

  // ACT
  const { getByTestId } = render(app);
  const count = getByTestId('count');

  // ASSERT
  expect(count.firstChild.textContent).toBe('0');
});

/* eslint-disable no-shadow */

it('with initial data', () => {
  // ARRANGE
  const Counter = createContextStore((data) => ({
    count: data.count || 0,
    inc: action((state) => {
      state.count += 1;
    }),
  }));

  function CountDisplay() {
    const count = Counter.useStoreState((state) => state.count);
    const inc = Counter.useStoreActions((actions) => actions.inc);
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
    <Counter.Provider runtimeModel={{ count: 1 }}>
      <CountDisplay />
    </Counter.Provider>
  );

  // ACT
  const { getByTestId } = render(app);

  const count = getByTestId('count');
  const button = getByTestId('button');

  // ASSERT
  expect(count.firstChild.textContent).toBe('1');

  // ACT
  fireEvent.click(button);

  // ASSERT
  expect(count.firstChild.textContent).toBe('2');
});

it('injections can be updated', () => {
  // ARRANGE
  let actualInjections = null;

  const Counter = createContextStore(
    {
      count: 0,
      foo: thunk((actions, payload, { injections }) => {
        actualInjections = injections;
      }),
    },
    {
      injections: {
        foo: 'initial',
      },
    },
  );

  // eslint-disable-next-line react/prop-types
  function Foo({ updater }) {
    const foo = Counter.useStoreActions((actions) => actions.foo);
    React.useEffect(() => {
      foo();
    }, [foo, updater]);
    return null;
  }

  // ACT
  const { rerender } = render(
    <Counter.Provider>
      <Foo updater={1} />
    </Counter.Provider>,
  );

  // ASSERT
  expect(actualInjections.foo).toBe('initial');

  // ACT
  rerender(
    <Counter.Provider injections={{ foo: 'updated' }}>
      <Foo updater={2} />
    </Counter.Provider>,
  );

  // ASSERT
  expect(actualInjections.foo).toBe('updated');
});
