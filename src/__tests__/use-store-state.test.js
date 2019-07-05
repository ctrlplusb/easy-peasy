/* eslint-disable react/prop-types */

import React from 'react';
import { act } from 'react-dom/test-utils';
import { render, fireEvent } from '@testing-library/react';
import { mockConsole } from './utils';
import {
  action,
  createStore,
  useStoreState,
  StoreProvider,
  useStoreActions,
  computed,
} from '../index';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message };
  }

  render() {
    const { hasError, message } = this.state;
    const { children } = this.props;
    if (hasError) {
      return <div data-testid="error">{message}</div>;
    }
    return children;
  }
}

let restoreConsole;

beforeEach(() => {
  jest.useFakeTimers();
  restoreConsole = mockConsole();
});

afterEach(() => {
  restoreConsole();
});

test('zombie children case is handled', () => {
  // arrange
  const store = createStore({
    items: {
      a: { name: 'A' },
      b: { name: 'B' },
      c: { name: 'C' },
    },
    deleteItem: action((state, payload) => {
      delete state.items[payload];
    }),
  });

  const ListItem = ({ id }) => {
    const name = useStoreState(s => s.items[id].name, [id]);
    return name;
  };

  function App() {
    const itemIds = useStoreState(s => Object.keys(s.items));
    const deleteItem = useStoreActions(a => a.deleteItem);
    const items = itemIds.map(id => <ListItem key={id} id={id} />);
    return (
      <>
        <div data-testid="items">{items}</div>
        <button
          data-testid="delete"
          type="button"
          onClick={() => deleteItem('b')}
        >
          Delete B
        </button>
      </>
    );
  }

  const app = (
    <StoreProvider store={store}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StoreProvider>
  );

  // act
  const { getByTestId } = render(app);

  // assert
  expect(getByTestId('items').innerHTML).toBe('ABC');

  // act
  fireEvent.click(getByTestId('delete'));

  // assert
  expect(getByTestId('items').innerHTML).toBe('AC');
});

test('throws an error if state mapping fails', () => {
  // arrange
  const store = createStore({
    todo: { text: 'foo' },
    remove: action(state => {
      delete state.todo;
    }),
  });

  function Todo() {
    const text = useStoreState(state => state.todo.text);
    return <div>{text}</div>;
  }

  function App() {
    const remove = useStoreActions(actions => actions.remove);
    return (
      <>
        <Todo />
        <button data-testid="remove" onClick={remove} type="button">
          Remove
        </button>
      </>
    );
  }

  const { getByTestId } = render(
    <StoreProvider store={store}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StoreProvider>,
  );

  // act
  act(() => {
    // multiple store updates should be idempotent
    fireEvent.click(getByTestId('remove'));
    fireEvent.click(getByTestId('remove'));
  });

  // assert
  expect(getByTestId('error').textContent).toMatch(
    "Cannot read property 'text' of undefined",
  );
});

test('throws an error for an invalid subscription only update', () => {
  // arrange
  const store = createStore({
    todo: { text: 'foo' },
    remove: action(state => {
      delete state.todo;
    }),
  });

  function App() {
    const text = useStoreState(state => state.todo.text);
    return <div>{text}</div>;
  }

  const { getByTestId } = render(
    <StoreProvider store={store}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StoreProvider>,
  );

  // act
  act(() => {
    store.getActions().remove();
  });

  // assert
  expect(getByTestId('error').textContent).toMatch(
    "Cannot read property 'text' of undefined",
  );
});

test('does not throw if state is removed', () => {
  // arrange
  const store = createStore({
    todos: {
      1: { text: 'write some tests' },
      2: { text: 'ensure hooks work' },
    },
    activeTodo: 1,
    completedActive: action(state => {
      if (state.activeTodo) {
        delete state.todos[state.activeTodo];
        const outstanding = Object.keys(state.todos);
        state.activeTodo = outstanding.length > 0 ? outstanding[0] : null;
      }
    }),
  });

  function Todo({ id }) {
    const text = useStoreState(state => state.todos[id].text);
    return <div data-testid="todo">{text}</div>;
  }

  function App() {
    const activeTodo = useStoreState(state => state.activeTodo);
    const completedActive = useStoreActions(actions => actions.completedActive);
    return (
      <>
        <Todo id={activeTodo} />
        <button data-testid="remove" onClick={completedActive} type="button">
          Remove
        </button>
      </>
    );
  }

  const app = (
    <StoreProvider store={store}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StoreProvider>
  );

  const { getByTestId, rerender } = render(app);

  // act
  fireEvent.click(getByTestId('remove'));

  // act
  rerender(app);

  // assert
  expect(getByTestId('todo').textContent).toEqual('ensure hooks work');
});

test('multiple hooks receive state update in same render cycle', () => {
  // arrange
  const store = createStore({
    items: [],
    count: computed(state => state.items.length),
    fetch: action(state => {
      state.items = ['foo'];
    }),
  });

  const renderSpy = jest.fn();

  function App() {
    const items = useStoreState(state => state.items);
    const count = useStoreState(state => state.count);
    renderSpy();
    return (
      <>
        <div data-testid="items">{items.join('')}</div>
        <div data-testid="count">{count}</div>
      </>
    );
  }

  const { getByTestId } = render(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>,
  );

  // assert
  expect(renderSpy).toHaveBeenCalledTimes(1);
  expect(getByTestId('items').textContent).toBe('');
  expect(getByTestId('count').textContent).toBe('0');

  // act
  act(() => {
    store.getActions().fetch();
  });

  // assert
  expect(renderSpy).toHaveBeenCalledTimes(2);
  expect(getByTestId('items').textContent).toBe('foo');
  expect(getByTestId('count').textContent).toBe('1');
});
