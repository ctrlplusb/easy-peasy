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
    // arrange
    const todo = { id: 1, text: 'Test my store' };
    const mockTodosService = {
      fetchById: jest.fn(() => Promise.resolve(todo)),
    };
    const store = createStore(todosModel, {
      injections: { todosService: mockTodosService },
    });

    // act
    await store.getActions().fetchById(todo.id);

    // assert
    expect(mockTodosService.fetchById).toHaveBeenCalledWith(todo.id);
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
      await store.getActions().throwing('A payload');
    } catch (err) {
      // assert
      expect(err.message).toEqual('poop');
    }
  });
});

describe('with mocking actions', () => {
  it('succeeds', async () => {
    // arrange
    const todo = { id: 1, text: 'Test my store' };
    const mockTodosService = {
      fetchById: jest.fn(() => Promise.resolve(todo)),
    };
    const store = createStore(todosModel, {
      injections: { todosService: mockTodosService },
      mockActions: true,
    });

    // act
    await store.getActions().fetchById(todo.id);

    // assert
    expect(mockTodosService.fetchById).toHaveBeenCalledWith(todo.id);
    expect(store.getMockedActions()).toEqual([
      { type: '@thunk.fetchById(start)', payload: todo.id },
      { type: '@action.fetchedTodo', payload: todo },
      { type: '@thunk.fetchById(success)', payload: todo.id },
    ]);
  });

  it('an error occurs', async () => {
    // arrange
    const err = new Error('poop');
    const model = {
      throwing: thunk((actions, payload, { fail }) => {
        fail(err);
      }),
    };
    const store = createStore(model, {
      mockActions: true,
    });

    // act
    try {
      await store.getActions().throwing('A payload');
    } catch (thrownError) {
      // assert
      expect(thrownError.message).toEqual('poop');
    }

    // assert
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
    await store.getActions().add();

    // assert
    expect(store.getMockedActions()).toEqual([
      { type: '@thunk.add(start)', payload: undefined },
      { type: 'CUSTOM_ACTION', payload: 'the payload' },
      { type: '@thunk.add(success)', payload: undefined },
    ]);
  });
});
