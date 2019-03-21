import React from 'react';
import { render, fireEvent } from 'react-testing-library';
import {
  action,
  actionName,
  createStore,
  listen,
  StoreProvider,
  thunk,
  thunkStartName,
  thunkCompleteName,
  thunkFailName,
  useStore,
  useActions,
} from '../index';

const todosModel = {
  items: {},
  add: action((state, payload) => {
    state.items[payload.id] = payload;
  }),
  fetchById: thunk(async (actions, payload, helpers) => {
    const { injections } = helpers;
    const todo = await injections
      .fetch(`/todos/${payload}`)
      .then(r => r.json());
    actions.add(todo);
  }),
};

const createFetchMock = response =>
  jest.fn(() => Promise.resolve({ json: () => Promise.resolve(response) }));

it('thunk', async () => {
  // arrange
  const todo = { id: 1, text: 'Test my store' };
  const fetch = createFetchMock(todo);
  const store = createStore(todosModel, {
    injections: { fetch },
    mockActions: true,
  });

  // act
  await store.dispatch.fetchById(todo.id);

  // assert
  expect(fetch).toHaveBeenCalledWith(`/todos/${todo.id}`);
  expect(store.getMockedActions()).toEqual([
    { type: thunkStartName(todosModel.fetchById), payload: todo.id },
    { type: actionName(todosModel.add), payload: todo },
    { type: thunkCompleteName(todosModel.fetchById), payload: todo.id },
  ]);
  expect(store.getState()).toEqual({ items: {} }); // No actual actions were run

  // act
  store.clearMockedActions();

  // assert
  expect(fetch).toHaveBeenCalledWith(`/todos/${todo.id}`);
  expect(store.getMockedActions()).toEqual([]);
});

it('thunk fail', async () => {
  // arrange
  const model = {
    throwing: thunk(() => {
      throw new Error('poop');
    }),
  };
  const store = createStore(model, {
    mockActions: true,
  });

  // act
  try {
    await store.dispatch.throwing('A payload');
  } catch (err) {
    // assert
    expect(err.message).toEqual('poop');
  }

  // assert
  expect(store.getMockedActions()).toMatchObject([
    { type: thunkStartName(model.throwing), payload: 'A payload' },
    {
      type: thunkFailName(model.throwing),
      payload: 'A payload',
      error: {
        message: 'poop',
        stack: /Error: poop/g,
      },
    },
  ]);
});

it('action', () => {
  // arrange
  const todo = { id: 1, text: 'foo' };
  const store = createStore(todosModel);

  // act
  store.dispatch.add(todo);

  // assert
  expect(store.getState().items).toEqual({ [todo.id]: todo });
});

it('string action fired in thunk', async () => {
  // arrange
  const store = createStore(
    {
      items: [],
      add: thunk((actions, payload, { dispatch }) => {
        dispatch({
          type: 'CUSTOM_ACTION',
          payload: 'the payload',
        });
      }),
    },
    {
      mockActions: true,
    },
  );

  // act
  await store.dispatch.add();

  // assert
  expect(store.getMockedActions()).toEqual([]);
});

it('component "integration" test', () => {
  // arrange
  function ComponentUnderTest() {
    const count = useStore(state => state.count);
    const increment = useActions(actions => actions.increment);
    return (
      <div>
        Count: <span data-testid="count">{count}</span>
        <button type="button" onClick={increment}>
          +
        </button>
      </div>
    );
  }

  const store = createStore({
    count: 0,
    increment: action(state => {
      state.count += 1;
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
  expect(getByTestId('count').textContent).toEqual('0');

  // act
  fireEvent.click(getByText('+'));

  // assert
  expect(getByTestId('count').textContent).toEqual('1');
});

it.skip('fired listeners', () => {
  // arrange
  const store = createStore(
    {
      items: [],
      audit: {
        routeChangeLogs: [],
        listeners: listen(on => {
          on(
            'ROUTE_CHANGED',
            action((state, payload) => {
              state.routeChangeLogs.push(payload);
            }),
          );
        }),
      },
    },
    { mockActions: true },
  );

  // act
  store.dispatch({
    type: 'ROUTE_CHANGED',
    payload: '/about',
  });

  // assert
  expect(store.getMockedActions()).toEqual([
    { type: 'ROUTE_CHANGED', payload: '/about' },
    { type: '@listen.audit.listeners(ROUTE_CHANGED)', payload: '/about' },
  ]);
});

it.skip('action listeners', () => {
  // arrange
  const store = createStore({
    items: [],
    audit: {
      routeChangeLogs: [],
      listeners: listen(on => {
        on(
          'ROUTE_CHANGED',
          action((state, payload) => {
            state.routeChangeLogs.push(payload);
          }),
        );
      }),
    },
  });

  // act
  store.dispatch({ type: 'ROUTE_CHANGED', payload: '/about' });

  // assert
  expect(store.getState().audit.routeChangeLogs).toEqual(['/about']);
});

describe('thunk listeners', () => {
  it('listening to string action', async () => {
    // arrange
    const model = {
      logs: [],
      log: action((state, payload) => {
        state.logs.push(payload);
      }),
      listeners: listen(on => {
        on(
          'ROUTE_CHANGED',
          thunk(async (actions, payload) => {
            // simulate some async to ensure async resolution works as expected
            await new Promise(resolve => setTimeout(resolve, 1));
            actions.log(payload);
          }),
        );
      }),
    };

    const store = createStore(model, {
      mockActions: true,
    });

    // act
    await store.triggerListener(model.listeners, 'ROUTE_CHANGED', '/about');

    // assert
    expect(store.getMockedActions()).toEqual([
      { type: actionName(model.log), payload: '/about' },
    ]);
  });

  it('listening to action', async () => {
    // arrange
    const model = {
      registerSession: action(() => {}),
      log: action(() => {}),
      listeners: listen(on => {
        on(
          model.registerSession,
          thunk(async (actions, payload) => {
            // simulate some async to ensure async resolution works as expected
            await new Promise(resolve => setTimeout(resolve, 1));
            actions.log(`Registered session: ${payload.username}`);
          }),
        );
      }),
    };

    const store = createStore(model, {
      mockActions: true,
    });

    // act
    await store.triggerListener(model.listeners, model.registerSession, {
      username: 'bob',
    });

    // assert
    expect(store.getMockedActions()).toEqual([
      {
        type: actionName(model.log),
        payload: 'Registered session: bob',
      },
    ]);
  });

  it('listening to thunk', async () => {
    // arrange
    const model = {
      registerSession: thunk(async () => {}),
      log: action(() => {}),
      listeners: listen(on => {
        on(
          model.registerSession,
          thunk(async (actions, payload) => {
            // simulate some async to ensure async resolution works as expected
            await new Promise(resolve => setTimeout(resolve, 1));
            actions.log(`Registered session: ${payload.username}`);
          }),
        );
      }),
    };

    const store = createStore(model, {
      mockActions: true,
    });

    // act
    await store.triggerListener(model.listeners, model.registerSession, {
      username: 'bob',
    });

    // assert
    expect(store.getMockedActions()).toEqual([
      {
        type: actionName(model.log),
        payload: 'Registered session: bob',
      },
    ]);
  });
});

it.skip('issue#129', async () => {
  // arrange
  const store = createStore({
    routeChangeLogs: [],
    log: action((state, payload) => {
      state.routeChangeLogs.push(payload);
    }),
    listeners: listen(on => {
      on(
        'ROUTE_CHANGED',
        thunk(async (actions, payload) => {
          await new Promise(resolve => setTimeout(resolve, 10));
          actions.log(payload);
        }),
      );
    }),
  });

  // act
  store.dispatch({
    type: 'ROUTE_CHANGED',
    payload: '/about',
  });

  // assert
  expect(store.getState().routeChangeLogs).toEqual(['/about']);
});
