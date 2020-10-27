import { action, createStore, thunk } from '../../src';

const tick = () => new Promise((resolve) => setTimeout(resolve, 1));

const todosModel = {
  items: {},
  fetchedTodo: action((state, payload) => {
    state.items[payload.id] = payload;
  }),
  fetchById: thunk(async (actions, payload, { injections }) => {
    const { todosService } = injections;
    const todo = await todosService.fetchById(payload);
    actions.fetchedTodo(todo);
  }),
};

describe('without mocking actions', () => {
  it('succeeds', async () => {
    // ARRANGE
    const todo = { id: 1, text: 'Test my store' };
    const mockTodosService = {
      fetchById: jest.fn(() => Promise.resolve(todo)),
    };
    const store = createStore(todosModel, {
      injections: { todosService: mockTodosService },
    });

    // ACT
    await store.getActions().fetchById(todo.id);

    // ASSERT
    expect(mockTodosService.fetchById).toHaveBeenCalledWith(todo.id);
    expect(store.getState()).toEqual({
      items: {
        1: todo,
      },
    });
  });

  it('an error occurs', async () => {
    // ARRANGE
    const model = {
      throwing: thunk(async () => {
        await tick();
        throw new Error('poop');
      }),
    };
    const store = createStore(model);

    // ACT
    try {
      await store.getActions().throwing('A payload');
    } catch (err) {
      // ASSERT
      expect(err.message).toEqual('poop');
    }
  });
});

describe('with mocking actions', () => {
  it('succeeds', async () => {
    // ARRANGE
    const todo = { id: 1, text: 'Test my store' };
    const mockTodosService = {
      fetchById: jest.fn(() => Promise.resolve(todo)),
    };
    const store = createStore(todosModel, {
      injections: { todosService: mockTodosService },
      mockActions: true,
    });

    // ACT
    await store.getActions().fetchById(todo.id);

    // ASSERT
    expect(mockTodosService.fetchById).toHaveBeenCalledWith(todo.id);
    expect(store.getMockedActions()).toEqual([
      { type: '@thunk.fetchById(start)', payload: todo.id },
      { type: '@action.fetchedTodo', payload: todo },
      { type: '@thunk.fetchById(success)', payload: todo.id },
    ]);
  });

  it('an error occurs', async () => {
    // ARRANGE
    const err = new Error('poop');
    const model = {
      throwing: thunk((actions, payload, { fail }) => {
        fail(err);
      }),
    };
    const store = createStore(model, {
      mockActions: true,
    });

    // ACT
    try {
      await store.getActions().throwing('A payload');
    } catch (thrownError) {
      // ASSERT
      expect(thrownError.message).toEqual('poop');
    }

    // ASSERT
    expect(store.getMockedActions()).toMatchObject([
      { type: '@thunk.throwing(start)', payload: 'A payload' },
      {
        type: '@thunk.throwing(fail)',
        payload: 'A payload',
        error: err,
      },
    ]);
  });

  it('string action fired within thunk', async () => {
    // ARRANGE
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

    // ACT
    await store.getActions().add();

    // ASSERT
    expect(store.getMockedActions()).toEqual([
      { type: '@thunk.add(start)', payload: undefined },
      { type: 'CUSTOM_ACTION', payload: 'the payload' },
      { type: '@thunk.add(success)', payload: undefined },
    ]);
  });
});
