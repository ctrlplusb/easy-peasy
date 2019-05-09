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

const tick = () => new Promise(resolve => setTimeout(resolve, 1));

describe('actions', () => {
  it('state gets updated', () => {
    // arrange
    const todo = { id: 1, text: 'foo' };
    const store = createStore(todosModel);

    // act
    store.dispatch.add(todo);

    // assert
    expect(store.getState().items).toEqual({ [todo.id]: todo });
  });
});

describe('thunks', () => {
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
});

describe('listeners', () => {
  it('listeners DO NOT fire when actions are mocked', () => {
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
    ]);
  });

  it('listeners fire when when actions are NOT mocked', () => {
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

  describe('triggerListeners', () => {
    describe('without mocking actions', () => {
      it('fires all listeners for action', async () => {
        // arrange
        const model = {
          logs: [],
          log: action((state, payload) => {
            state.logs.push(payload);
          }),
          registerSession: action(() => {}),
          listeners: listen(on => {
            on(
              model.registerSession,
              action((state, payload) => {
                state.logs.push(`action fired ${payload.username}`);
              }),
            );
            on(
              model.registerSession,
              thunk(async (actions, payload) => {
                await tick();
                actions.log(`thunk fired ${payload.username}`);
              }),
            );
          }),
        };
        const store = createStore(model);

        // act
        await store.triggerListeners(model.registerSession, {
          username: 'bob',
        });

        // assert
        expect(store.getState().logs).toEqual([
          'action fired bob',
          'thunk fired bob',
        ]);
      });

      it('fires all listeners for thunk', async () => {
        // arrange
        const model = {
          logs: [],
          log: action((state, payload) => {
            state.logs.push(payload);
          }),
          registerSession: thunk(() => {}),
          listeners: listen(on => {
            on(
              model.registerSession,
              action((state, payload) => {
                state.logs.push(`action fired ${payload.username}`);
              }),
            );
            on(
              model.registerSession,
              thunk(async (actions, payload) => {
                await tick();
                actions.log(`thunk fired ${payload.username}`);
              }),
            );
          }),
        };
        const store = createStore(model);

        // act
        await store.triggerListeners(model.registerSession, {
          username: 'bob',
        });

        // assert
        expect(store.getState().logs).toEqual([
          'action fired bob',
          'thunk fired bob',
        ]);
      });

      it('fires all listeners for string action', async () => {
        // arrange
        const model = {
          logs: [],
          log: action((state, payload) => {
            state.logs.push(payload);
          }),
          listeners: listen(on => {
            on(
              'REGISTER',
              action((state, payload) => {
                state.logs.push(`action fired ${payload.username}`);
              }),
            );
            on(
              'REGISTER',
              thunk(async (actions, payload) => {
                await tick();
                actions.log(`thunk fired ${payload.username}`);
              }),
            );
          }),
        };
        const store = createStore(model);

        // act
        await store.triggerListeners('REGISTER', { username: 'bob' });

        // assert
        expect(store.getState().logs).toEqual([
          'action fired bob',
          'thunk fired bob',
        ]);
      });
    });

    describe('with mocking actions', () => {
      it('fires all listeners for action', async () => {
        // arrange
        const model = {
          logs: [],
          log: action((state, payload) => {
            state.logs.push(payload);
          }),
          registerSession: action(() => {}),
          listeners: listen(on => {
            on(
              model.registerSession,
              action((state, payload) => {
                state.logs.push(`action fired ${payload.username}`);
              }),
            );
            on(
              model.registerSession,
              thunk(async (actions, payload) => {
                await tick();
                actions.log(`thunk fired ${payload.username}`);
              }),
            );
          }),
        };
        const store = createStore(model, { mockActions: true });

        // act
        await store.triggerListeners(model.registerSession, {
          username: 'bob',
        });

        // assert
        expect(store.getMockedActions()).toEqual([
          { type: '@action.log', payload: 'thunk fired bob' },
        ]);
      });

      it('fires all listeners for thunk', async () => {
        // arrange
        const model = {
          logs: [],
          log: action((state, payload) => {
            state.logs.push(payload);
          }),
          registerSession: thunk(() => {}),
          listeners: listen(on => {
            on(
              model.registerSession,
              action((state, payload) => {
                state.logs.push(`action fired ${payload.username}`);
              }),
            );
            on(
              model.registerSession,
              thunk(async (actions, payload) => {
                await tick();
                actions.log(`thunk fired ${payload.username}`);
              }),
            );
          }),
        };
        const store = createStore(model, { mockActions: true });

        // act
        await store.triggerListeners(model.registerSession, {
          username: 'bob',
        });

        // assert
        expect(store.getMockedActions()).toEqual([
          { type: '@action.log', payload: 'thunk fired bob' },
        ]);
      });

      it('fires all listeners for string action', async () => {
        // arrange
        const model = {
          logs: [],
          log: action((state, payload) => {
            state.logs.push(payload);
          }),
          listeners: listen(on => {
            on(
              'REGISTER',
              action((state, payload) => {
                state.logs.push(`action fired ${payload.username}`);
              }),
            );
            on(
              'REGISTER',
              thunk(async (actions, payload) => {
                await actions.log(`thunk fired ${payload.username}`);
              }),
            );
          }),
        };
        const store = createStore(model, { mockActions: true });

        // act
        await store.triggerListeners('REGISTER', { username: 'bob' });

        // assert
        expect(store.getState().logs).toEqual([]);
        expect(store.getMockedActions()).toEqual([
          { type: '@action.log', payload: 'thunk fired bob' },
        ]);
      });
    });
  });

  describe('triggerListener', () => {
    describe('action handlers', () => {
      it('for a string action', async () => {
        // arrange
        const model = {
          logs: [],
          listeners: listen(on => {
            on(
              'ROUTE_CHANGED',
              action((state, payload) => {
                state.logs.push(payload);
              }),
            );
          }),
        };

        const store = createStore(model);

        // act
        store.triggerListener(model.listeners, 'ROUTE_CHANGED', '/about');

        // assert
        expect(store.getState().logs).toEqual(['/about']);
      });

      it('for an action', async () => {
        // arrange
        const model = {
          registerSession: action(() => {}),
          logs: [],
          listeners: listen(on => {
            on(
              model.registerSession,
              action((state, payload) => {
                state.logs.push(`Registered session for ${payload.username}`);
              }),
            );
          }),
        };

        const store = createStore(model);

        // act
        store.triggerListener(model.listeners, model.registerSession, {
          username: 'bob',
        });

        // assert
        expect(store.getState().logs).toEqual(['Registered session for bob']);
      });

      it('for a thunk', async () => {
        // arrange
        const model = {
          registerSession: thunk(() => {}),
          logs: [],
          listeners: listen(on => {
            on(
              model.registerSession,
              action((state, payload) => {
                state.logs.push(`Registered session for ${payload.username}`);
              }),
            );
          }),
        };

        const store = createStore(model);

        // act
        await store.triggerListener(model.listeners, model.registerSession, {
          username: 'bob',
        });

        // assert
        expect(store.getState().logs).toEqual(['Registered session for bob']);
      });
    });

    describe('thunk handlers', () => {
      describe('without mocking actions', () => {
        it('for a string action', async () => {
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

          const store = createStore(model);

          // act
          await store.triggerListener(
            model.listeners,
            'ROUTE_CHANGED',
            '/about',
          );

          // assert
          expect(store.getState().logs).toEqual(['/about']);
        });

        it('for an action', async () => {
          // arrange
          const model = {
            logs: [],
            log: action((state, payload) => {
              state.logs.push(payload);
            }),
            registerSession: action(() => {}),
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

          const store = createStore(model);

          // act
          await store.triggerListener(model.listeners, model.registerSession, {
            username: 'bob',
          });

          // assert
          expect(store.getState().logs).toEqual(['Registered session: bob']);
        });

        it('for a thunk', async () => {
          // arrange
          const model = {
            logs: [],
            log: action((state, payload) => {
              state.logs.push(payload);
            }),
            registerSession: thunk(async () => {}),
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

          const store = createStore(model);

          // act
          await store.triggerListener(model.listeners, model.registerSession, {
            username: 'bob',
          });

          // assert
          expect(store.getState().logs).toEqual(['Registered session: bob']);
        });
      });

      describe('with mocking actions', () => {
        it('for a string action', async () => {
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
          await store.triggerListener(
            model.listeners,
            'ROUTE_CHANGED',
            '/about',
          );

          // assert
          expect(store.getMockedActions()).toEqual([
            { type: actionName(model.log), payload: '/about' },
          ]);
        });

        it('for an action', async () => {
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

        it('for a thunk', async () => {
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
    });
  });
});

describe('react', () => {
  it('component integration test', () => {
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
});
