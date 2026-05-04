import React, { act } from 'react';
import { render, fireEvent } from '@testing-library/react';
import {
  action,
  createStore,
  StoreProvider,
  thunk,
  useStoreActions,
  useStoreOptimistic,
} from '../src';

test('returns the current state on initial render', () => {
  const store = createStore({
    items: ['a'],
  });

  function App() {
    const [items] = useStoreOptimistic(
      (s) => s.items,
      (current, pending) => [...current, pending],
    );
    return <div data-testid="items">{items.join(',')}</div>;
  }

  const { getByTestId } = render(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>,
  );

  expect(getByTestId('items').textContent).toBe('a');
});

test('reflects store updates from dispatched actions', () => {
  const store = createStore({
    items: ['a'],
    addItem: action((state, payload) => {
      state.items.push(payload);
    }),
  });

  function App() {
    const [items] = useStoreOptimistic(
      (s) => s.items,
      (current, pending) => [...current, pending],
    );
    const addItem = useStoreActions((a) => a.addItem);
    return (
      <>
        <div data-testid="items">{items.join(',')}</div>
        <button data-testid="add" onClick={() => addItem('b')} type="button">
          add
        </button>
      </>
    );
  }

  const { getByTestId } = render(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>,
  );

  expect(getByTestId('items').textContent).toBe('a');

  act(() => {
    fireEvent.click(getByTestId('add'));
  });

  expect(getByTestId('items').textContent).toBe('a,b');
});

test('shows optimistic value during a pending async transition', async () => {
  let resolveThunk;
  const store = createStore({
    items: ['a'],
    addItem: action((state, payload) => {
      state.items.push(payload);
    }),
    addItemAsync: thunk(async (actions, payload) => {
      await new Promise((resolve) => {
        resolveThunk = resolve;
      });
      actions.addItem(payload);
    }),
  });

  function App() {
    const [items, addOptimistic] = useStoreOptimistic(
      (s) => s.items,
      (current, pending) => [...current, `${pending}-pending`],
    );
    const addItemAsync = useStoreActions((a) => a.addItemAsync);
    return (
      <>
        <div data-testid="items">{items.join(',')}</div>
        <button
          data-testid="add"
          onClick={() => {
            React.startTransition(async () => {
              addOptimistic('b');
              await addItemAsync('b');
            });
          }}
          type="button"
        >
          add
        </button>
      </>
    );
  }

  const { getByTestId } = render(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>,
  );

  expect(getByTestId('items').textContent).toBe('a');

  await act(async () => {
    fireEvent.click(getByTestId('add'));
  });

  expect(getByTestId('items').textContent).toBe('a,b-pending');

  await act(async () => {
    resolveThunk();
  });

  expect(getByTestId('items').textContent).toBe('a,b');
});
