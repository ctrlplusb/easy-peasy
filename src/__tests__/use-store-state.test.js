/* eslint-disable react/prop-types */

import React from 'react';
import { act } from 'react-dom/test-utils';
import { render, fireEvent } from 'react-testing-library';

import {
  action,
  createStore,
  useStoreState,
  StoreProvider,
  useStoreActions,
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

describe('mapState errors', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  describe('zombie children', () => {
    test('renders successfully within window of opportunity', () => {
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
      act(() => {
        fireEvent.click(getByTestId('delete'));
      });

      // assert
      expect(getByTestId('items').innerHTML).toBe('AC');

      // act
      act(() => {
        jest.runAllTimers();
      });

      // assert
      expect(getByTestId('items').innerHTML).toBe('AC');
      expect(setTimeout).toHaveBeenCalledTimes(2);
      expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 200);
    });
  });

  describe('state getting removed', () => {
    let app;
    let store;
    let App;

    beforeEach(() => {
      store = createStore({
        todos: {
          1: { text: 'write some tests' },
          2: { text: 'ensure hooks work' },
        },
        removeTodo: action((state, payload) => {
          delete state.todos[payload];
        }),
      });

      function Todo({ id }) {
        const text = useStoreState(s => s.todos[id].text, [id]);
        return <div data-testid="todo">{text}</div>;
      }

      App = ({ activeTodo = 1, displayTodo = true }) => {
        const removeTodo = useStoreActions(a => a.removeTodo);
        return (
          <>
            {displayTodo ? (
              <Todo id={activeTodo} />
            ) : (
              <div data-testid="no-todo">No todo</div>
            )}
            <button
              data-testid="remove"
              onClick={() => removeTodo(activeTodo)}
              type="button"
            >
              Remove todo
            </button>
          </>
        );
      };

      app = (
        <StoreProvider store={store}>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </StoreProvider>
      );
    });

    test('throws an error if the window of opportunity is exceeded', () => {
      // arrange
      const { getByTestId } = render(app);

      // act
      act(() => {
        // multiple store updates should be idempotent
        fireEvent.click(getByTestId('remove'));
        fireEvent.click(getByTestId('remove'));
      });

      // assert
      expect(getByTestId('todo').textContent).toEqual('write some tests');

      // act
      act(() => {
        jest.runAllTimers();
      });

      // assert
      expect(getByTestId('error').textContent).toEqual(
        "Cannot read property 'text' of undefined",
      );
    });

    test('does not throw if the component unmounts', () => {
      // arrange
      const { getByTestId, rerender } = render(app);

      // act
      act(() => {
        fireEvent.click(getByTestId('remove'));
      });

      // assert
      expect(getByTestId('todo').textContent).toEqual('write some tests');

      // act
      rerender(
        <StoreProvider store={store}>
          <ErrorBoundary>
            <App displayTodo={false} />
          </ErrorBoundary>
        </StoreProvider>,
      );
      act(() => {
        jest.runAllTimers();
      });

      // assert
      expect(getByTestId('no-todo').textContent).toEqual('No todo');
    });

    test('does not throw if the component gets new props that map to valid state', () => {
      // arrange
      const { getByTestId, rerender } = render(app);

      // act
      act(() => {
        fireEvent.click(getByTestId('remove'));
      });

      // assert
      expect(getByTestId('todo').textContent).toEqual('write some tests');

      // act
      rerender(
        <StoreProvider store={store}>
          <ErrorBoundary>
            <App activeTodo={2} />
          </ErrorBoundary>
        </StoreProvider>,
      );
      act(() => {
        jest.runAllTimers();
      });

      // assert
      expect(getByTestId('todo').textContent).toEqual('ensure hooks work');
    });
  });
});
