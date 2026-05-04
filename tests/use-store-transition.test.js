import React from 'react';
import { act } from 'react-dom/test-utils';
import { render, fireEvent } from '@testing-library/react';
import {
  action,
  createStore,
  StoreProvider,
  useStoreState,
  useStoreTransition,
  thunk,
} from '../src';

test('wraps a single action and exposes isPending', () => {
  // ARRANGE
  const store = createStore({
    count: 0,
    increment: action((state) => {
      state.count += 1;
    }),
  });

  function App() {
    const count = useStoreState((s) => s.count);
    const [increment, isPending] = useStoreTransition((a) => a.increment);
    return (
      <>
        <div data-testid="count">{count}</div>
        <div data-testid="pending">{isPending ? 'yes' : 'no'}</div>
        <button data-testid="bump" onClick={() => increment()} type="button">
          bump
        </button>
      </>
    );
  }

  const { getByTestId } = render(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>,
  );

  // ASSERT
  expect(getByTestId('count').textContent).toBe('0');
  expect(getByTestId('pending').textContent).toBe('no');

  // ACT
  act(() => {
    fireEvent.click(getByTestId('bump'));
  });

  // ASSERT
  expect(getByTestId('count').textContent).toBe('1');
});

test('recursively wraps function leaves of an object selector', () => {
  // ARRANGE
  const store = createStore({
    todos: {
      items: [],
      add: action((state, payload) => {
        state.items.push(payload);
      }),
      clear: action((state) => {
        state.items = [];
      }),
    },
  });

  function App() {
    const items = useStoreState((s) => s.todos.items);
    const [todos] = useStoreTransition((a) => a.todos);
    return (
      <>
        <div data-testid="items">{items.join(',')}</div>
        <button
          data-testid="add"
          onClick={() => todos.add('write tests')}
          type="button"
        >
          add
        </button>
        <button data-testid="clear" onClick={() => todos.clear()} type="button">
          clear
        </button>
      </>
    );
  }

  const { getByTestId } = render(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>,
  );

  // ACT
  act(() => {
    fireEvent.click(getByTestId('add'));
  });

  // ASSERT
  expect(getByTestId('items').textContent).toBe('write tests');

  // ACT
  act(() => {
    fireEvent.click(getByTestId('clear'));
  });

  // ASSERT
  expect(getByTestId('items').textContent).toBe('');
});

test('wrapped thunks return their original promise', async () => {
  // ARRANGE
  const store = createStore({
    items: [],
    addItem: action((state, payload) => {
      state.items.push(payload);
    }),
    fetchItem: thunk(async (actions, payload) => {
      actions.addItem(payload);
      return `done:${payload}`;
    }),
  });

  let captured;

  function App() {
    const [fetchItem] = useStoreTransition((a) => a.fetchItem);
    return (
      <button
        data-testid="fetch"
        onClick={() => {
          captured = fetchItem('one');
        }}
        type="button"
      >
        fetch
      </button>
    );
  }

  const { getByTestId } = render(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>,
  );

  // ACT
  await act(async () => {
    fireEvent.click(getByTestId('fetch'));
  });

  // ASSERT
  await expect(captured).resolves.toBe('done:one');
  expect(store.getState().items).toEqual(['one']);
});
