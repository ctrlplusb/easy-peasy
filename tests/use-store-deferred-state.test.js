import React, { act } from 'react';
import { render, fireEvent } from '@testing-library/react';
import {
  action,
  createStore,
  StoreProvider,
  useStoreActions,
  useStoreDeferredState,
} from '../src';

test('returns the current state on initial render', () => {
  // ARRANGE
  const store = createStore({
    name: 'Alice',
  });

  function App() {
    const name = useStoreDeferredState((s) => s.name);
    return <div data-testid="name">{name}</div>;
  }

  const { getByTestId } = render(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>,
  );

  // ASSERT
  expect(getByTestId('name').textContent).toBe('Alice');
});

test('updates after a dispatched action', () => {
  // ARRANGE
  const store = createStore({
    name: 'Alice',
    setName: action((state, payload) => {
      state.name = payload;
    }),
  });

  function App() {
    const name = useStoreDeferredState((s) => s.name);
    const setName = useStoreActions((a) => a.setName);
    return (
      <>
        <div data-testid="name">{name}</div>
        <button data-testid="rename" onClick={() => setName('Bob')} type="button">
          rename
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
    fireEvent.click(getByTestId('rename'));
  });

  // ASSERT
  expect(getByTestId('name').textContent).toBe('Bob');
});

test('respects the equality function to avoid spurious updates', () => {
  // ARRANGE
  const renderSpy = vi.fn();

  const store = createStore({
    user: { id: 1, name: 'Alice' },
    rename: action((state, payload) => {
      state.user = { ...state.user, name: payload };
    }),
  });

  function App() {
    const user = useStoreDeferredState(
      (s) => s.user,
      (prev, next) => prev.id === next.id,
    );
    const rename = useStoreActions((a) => a.rename);
    renderSpy(user.name);
    return (
      <>
        <div data-testid="name">{user.name}</div>
        <button data-testid="rename" onClick={() => rename('Bob')} type="button">
          rename
        </button>
      </>
    );
  }

  const { getByTestId } = render(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>,
  );

  expect(renderSpy).toHaveBeenLastCalledWith('Alice');

  // ACT
  act(() => {
    fireEvent.click(getByTestId('rename'));
  });

  // ASSERT — equality fn collapses to same id, so deferred value stays Alice
  expect(getByTestId('name').textContent).toBe('Alice');
});
