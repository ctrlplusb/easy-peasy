import React, { useEffect } from 'react';
import { act } from 'react-dom/test-utils';
import { render, fireEvent } from 'react-testing-library';
import {
  action,
  createStore,
  derived,
  StoreProvider,
  useStoreState,
  useStoreActions,
} from '../index';

it('deriving against local state', () => {
  // arrange
  const store = createStore({
    todos: {
      items: ['foo'],
      count: derived([state => state.items], items => items.length),
    },
  });

  // assert
  expect(store.getState().todos.count()).toBe(1);
});

it('supports multiple derived state arguments', () => {
  // arrange
  const store = createStore({
    todos: {
      countLabel: 'Count',
      items: ['foo'],
      count: derived(
        [state => state.items, state => state.countLabel],
        (items, label) => `${label}: ${items.length}`,
      ),
    },
  });

  // assert
  expect(store.getState().todos.count()).toBe('Count: 1');
});

it('has a memoisation limit of 1 by default', () => {
  // arrange
  let runCount = 0;
  const todoOne = { id: 1, text: 'foo' };
  const todoTwo = { id: 2, text: 'bar' };
  const store = createStore({
    todos: {
      items: [todoOne, todoTwo],
      getById: derived([state => state.items], (items, id) => {
        runCount += 1;
        return items.find(x => x.id === id);
      }),
    },
  });

  // act
  let todo = store.getState().todos.getById(1);

  // assert
  expect(runCount).toBe(1);
  expect(todo).toEqual(todoOne);

  // act
  todo = store.getState().todos.getById(1);

  // assert
  expect(runCount).toBe(1);
  expect(todo).toEqual(todoOne);

  // act
  todo = store.getState().todos.getById(2);

  // assert
  expect(runCount).toBe(2);
  expect(todo).toEqual(todoTwo);

  // act
  todo = store.getState().todos.getById(2);

  // assert
  expect(runCount).toBe(2);
  expect(todo).toEqual(todoTwo);

  // act
  todo = store.getState().todos.getById(1);

  // assert
  expect(runCount).toBe(3);
  expect(todo).toEqual(todoOne);
});

it('supports customisation on the memoisation limit', () => {
  // arrange
  let runCount = 0;
  const todoOne = { id: 1, text: 'foo' };
  const todoTwo = { id: 2, text: 'bar' };
  const store = createStore({
    todos: {
      items: [todoOne, todoTwo],
      getById: derived(
        [state => state.items],
        (items, id) => {
          runCount += 1;
          return items.find(x => x.id === id);
        },
        { limit: 2 },
      ),
    },
  });

  // act
  let todo = store.getState().todos.getById(1);

  // assert
  expect(runCount).toBe(1);
  expect(todo).toEqual(todoOne);

  // act
  todo = store.getState().todos.getById(1);

  // assert
  expect(runCount).toBe(1);
  expect(todo).toEqual(todoOne);

  // act
  todo = store.getState().todos.getById(2);

  // assert
  expect(runCount).toBe(2);
  expect(todo).toEqual(todoTwo);

  // act
  todo = store.getState().todos.getById(2);

  // assert
  expect(runCount).toBe(2);
  expect(todo).toEqual(todoTwo);

  // act
  todo = store.getState().todos.getById(1);

  // assert
  expect(runCount).toBe(2);
  expect(todo).toEqual(todoOne);
});

it('supports execution time arguments', () => {
  // arrange
  const store = createStore({
    todos: {
      items: [{ id: 1, text: 'foo' }],
      getById: derived([state => state.items], (items, id) => {
        return items.find(x => x.id === id);
      }),
    },
  });

  // assert
  expect(store.getState().todos.getById(1)).toEqual({ id: 1, text: 'foo' });
});

it('supports multiple execution time arguments and multiple custom derived state arguments', () => {
  // arrange
  const store = createStore({
    todos: {
      countLabel: 'Count',
      items: ['foo'],
      count: derived(
        [state => state.items, state => state.countLabel],
        (items, label, runtimeArg1, runtimeArg2) =>
          `${label}: ${items.length} ${runtimeArg1}${runtimeArg2}`,
      ),
    },
  });

  // assert
  expect(store.getState().todos.count('(Rad', 'ness)')).toBe(
    'Count: 1 (Radness)',
  );
});

it('supports accessing state across the model', () => {
  // arrange
  const store = createStore({
    todos: {
      items: { 1: { id: 1, text: 'foo' } },
    },
    settings: {
      favouriteTodoId: 1,
      favouriteTodo: derived(
        [
          state => state.favouriteTodoId,
          (state, storeState) => storeState.todos.items,
        ],
        (favouriteTodoId, todos) => todos[favouriteTodoId],
      ),
    },
  });

  // assert
  expect(store.getState().settings.favouriteTodo()).toEqual({
    id: 1,
    text: 'foo',
  });
});

it('supports accessing a derived state from another', () => {
  // arrange
  const store = createStore({
    todos: {
      items: { 1: { id: 1, text: 'foo' } },
      getById: derived([state => state.items], (items, id) => items[id]),
    },
    settings: {
      favouriteTodoId: 1,
      favouriteTodo: derived(
        [
          state => state.favouriteTodoId,
          (state, storeState) => storeState.todos.getById,
        ],
        (favouriteTodoId, getTodoById) => getTodoById(favouriteTodoId),
      ),
    },
  });

  // assert
  expect(store.getState().settings.favouriteTodo()).toEqual({
    id: 1,
    text: 'foo',
  });
});

describe('react', () => {
  it('components are rerendered when updates occur on arguments', () => {
    // arrange
    let renderCount = 0;
    function ComponentUnderTest() {
      const count = useStoreState(state => state.todos.count);
      const addTodo = useStoreActions(actions => actions.todos.addTodo);
      useEffect(() => {
        renderCount += 1;
      });
      return (
        <div>
          Count: <span data-testid="count">{count()}</span>
          <button type="button" onClick={addTodo}>
            +
          </button>
        </div>
      );
    }

    const store = createStore({
      todos: {
        items: [{ id: 1, text: 'foo' }],
        count: derived([state => state.items], items => items.length),
        addTodo: action(state => {
          state.items.push({
            id: 2,
            text: 'bar',
          });
        }),
      },
      other: 'foo',
      updateOther: action(state => {
        state.other = 'bar';
      }),
    });

    const app = (
      <StoreProvider store={store}>
        <ComponentUnderTest />
      </StoreProvider>
    );

    // act
    const { getByTestId, getByText } = render(app);

    // assert
    expect(renderCount).toBe(1);
    expect(getByTestId('count').textContent).toEqual('1');

    // act
    fireEvent.click(getByText('+'));

    // assert
    expect(renderCount).toBe(2);
    expect(getByTestId('count').textContent).toEqual('2');

    // act
    act(() => {
      store.dispatch.updateOther();
    });

    // assert
    expect(renderCount).toBe(2);
  });

  it('components are rerendered when global state arguments are updated', () => {
    // arrange
    let renderCount = 0;
    function ComponentUnderTest() {
      const favouriteTodo = useStoreState(
        state => state.settings.favouriteTodo,
      );
      useEffect(() => {
        renderCount += 1;
      });
      return (
        <div>
          Favourite Todo:{' '}
          <span data-testid="favourite">{favouriteTodo().text}</span>
        </div>
      );
    }

    const store = createStore({
      todos: {
        items: { 1: { id: 1, text: 'My Todo' } },
        updateTodo: action(state => {
          state.items['1'].text = 'Updated Todo';
        }),
      },
      settings: {
        favouriteTodoId: 1,
        favouriteTodo: derived(
          [
            state => state.favouriteTodoId,
            (state, storeState) => storeState.todos.items,
          ],
          (favouriteTodoId, todos) => todos[favouriteTodoId],
        ),
      },
      other: 'foo',
      updateOther: action(state => {
        state.other = 'bar';
      }),
    });

    const app = (
      <StoreProvider store={store}>
        <ComponentUnderTest />
      </StoreProvider>
    );

    // act
    const { getByTestId } = render(app);

    // assert
    expect(renderCount).toBe(1);
    expect(getByTestId('favourite').textContent).toEqual('My Todo');

    // act
    act(() => {
      store.dispatch.todos.updateTodo();
    });

    // assert
    expect(renderCount).toBe(2);
    expect(getByTestId('favourite').textContent).toEqual('Updated Todo');

    // act
    act(() => {
      store.dispatch.updateOther();
    });

    // assert
    expect(renderCount).toBe(2);
  });

  it('components are not rerendered due to state updates that are not related to the selector', () => {
    // arrange
    let renderCount = 0;
    function ComponentUnderTest() {
      const count = useStoreState(state => state.todos.count);
      const addTodo = useStoreActions(actions => actions.todos.addTodo);
      useEffect(() => {
        renderCount += 1;
      });
      return (
        <div>
          Count: <span data-testid="count">{count()}</span>
          <button type="button" onClick={addTodo}>
            +
          </button>
        </div>
      );
    }

    const store = createStore({
      todos: {
        items: [{ id: 1, text: 'foo' }],
        count: derived([state => state.items], items => items.length),
        addTodo: action(state => {
          state.items.push({
            id: 2,
            text: 'bar',
          });
        }),
        unrelated: 'bob',
        updateUnrelated: action(state => {
          state.unrelated = 'qux';
        }),
      },
    });

    const app = (
      <StoreProvider store={store}>
        <ComponentUnderTest />
      </StoreProvider>
    );

    // act
    const { getByTestId, getByText } = render(app);

    // assert
    expect(renderCount).toEqual(1);
    expect(getByTestId('count').textContent).toEqual('1');

    // act
    fireEvent.click(getByText('+'));

    // assert
    expect(renderCount).toEqual(2);
    expect(getByTestId('count').textContent).toEqual('2');

    // act
    act(() => {
      store.dispatch.todos.updateUnrelated();
    });

    // assert
    expect(renderCount).toEqual(2);
    expect(getByTestId('count').textContent).toEqual('2');
  });
});
