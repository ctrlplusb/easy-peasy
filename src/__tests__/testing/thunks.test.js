/**
 * These tests show how you can test thunks.
 *
 * Thunks are a bit more complicated as they can often include network calls. We
 * recommend that you make use of the `injections` configuration value for
 * `createStore` to expose network clients to your thunks. Doing this will allow
 * you to provide mocked versions of your network clients during testing. You
 * will see this strategy employed below.
 *
 * There are also 2 different strategies at testing thunks:
 *   1. Allow thunks to execute naturally
 *   2. Configure the store to mock any actions
 *
 * We will show both strategies below.
 */

import {
  action,
  actionName,
  createStore,
  thunk,
  thunkStartName,
  thunkCompleteName,
  thunkFailName,
} from '../../index';

const tick = () => new Promise(resolve => setTimeout(resolve, 1));

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

/**
 * Within the below tests we will not be mocking any actions. i.e. we will
 * allow thunks to execute naturally. This means that any actions that are
 * called within a thunk will be executed.
 *
 * This provides more of an integration test as you are crossing boundaries,
 * executing actions outside of your thunk.
 *
 * You would then generally make two different types of assertions within
 * this strategy:
 *   1. Were the mocked injections called as expected?
 *   2. Did the state get updated in the expected manner?
 */
describe('without mocking actions', () => {
  it('succeeds', async () => {
    // arrange
    const todo = { id: 1, text: 'Test my store' };
    const fetch = createFetchMock(todo);
    const store = createStore(todosModel, {
      injections: { fetch },
    });

    // act
    await store.dispatch.fetchById(todo.id);

    // assert
    expect(fetch).toHaveBeenCalledWith(`/todos/${todo.id}`);
    expect(store.getState()).toEqual({
      items: {
        1: todo,
      },
    });
  });

  it('an error occurs', async () => {
    // arrange
    const model = {
      throwing: thunk(async () => {
        await tick();
        throw new Error('poop');
      }),
    };
    const store = createStore(model);

    // act
    try {
      await store.dispatch.throwing('A payload');
    } catch (err) {
      // assert
      expect(err.message).toEqual('poop');
    }
  });
});

/**
 * Within the following tests we will be mocking the actions via the
 * `mockActions` configuration value of `createStore`. When this setting is
 * enabled then any actions that are called will not actually be executed,
 * instead they will be mocked.
 *
 * Mocked actions can then be accessed via the store:
 *
 * ```
 * store.getMockedActions();
 * ```
 *
 * This will return an array of objects, where each object contains the name
 * of the action that was called.
 *
 * You can use this to assert the actions that you expected your thunk to
 * execute.
 *
 * You would then generally make two different types of assertions within
 * this strategy:
 *   1. Were the mocked injections called as expected?
 *   2. Which actions were fired, and with what payload?
 */
describe('with mocking actions', () => {
  it('succeeds', async () => {
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

  it('an error occurs', async () => {
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

  it('string action fired within thunk', async () => {
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
    expect(store.getMockedActions()).toEqual([
      { type: '@thunk.add(started)', payload: undefined },
      { type: 'CUSTOM_ACTION', payload: 'the payload' },
      { type: '@thunk.add(completed)', payload: undefined },
    ]);
  });
});
