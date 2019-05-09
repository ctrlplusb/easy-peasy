/**
 * These tests show you how you can test listeners.
 *
 * You define listeners via the `listen` helper. Within your listener definition
 * you can then define as many handlers as you like to be fired when specfic
 * action types have been processed successfully.
 *
 * In order to help test listeners two APIs are exposed via the store that is
 * returned by `createStore`:
 *
 *   1. triggerListener
 *      This helper will fire handlers, scoped to the provided listener
 *      reference, that have been configured to listen to the type of action
 *      provided.
 *   2. triggerListeners
 *      This helper will fire ALL handlers registered across the entire model
 *      that have been configured to listen to the type of action provided.
 *
 *  Generally we recommend that you use the `triggerListener` API as it
 *  provides more a more isolated focus for your tests. Therefore your tests
 *  are less likely to break when new listener handlers are added for a specific
 *  action type across your model.
 */

import { action, actionName, createStore, listen, thunk } from '../../index';

const tick = () => new Promise(resolve => setTimeout(resolve, 1));

/**
 * The following tests demonstrate how to use the `triggerListener` API to
 * test your listeners. These allow you to scope your tests to a specific
 * listener definition from your model and allow you to provide an action
 * to test your listeners against.
 */
describe('triggerListener', () => {
  /**
   * The following tests show you how to test listener handlers that are action
   * types - i.e. they are expected to do state updates.
   */
  describe('action handlers', () => {
    /**
     * In this test our listener is listening to an action type defined as a
     * string. This is typically useful when listening to actions from 3rd
     * party integrations - e.g. redux-first-history, where the 3rd party code
     * fires traditional Redux actions.
     */
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

  /**
   * The following tests show you how to test listener handlers that are thunk
   * types - i.e. they are expected to perform side effects (e.g. network calls)
   * and/or fire actions.
   */
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
        await store.triggerListener(model.listeners, 'ROUTE_CHANGED', '/about');

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
        await store.triggerListener(model.listeners, 'ROUTE_CHANGED', '/about');

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

/**
 * The following tests demonstrate how to use the `triggerListeners` API to
 * test your listeners. Using this API will allow you to fire an action, and
 * have all the registered handlers across your model be exectued.
 *
 * This should only be used for advanced cases. It's far more an integration
 * test and will naturally be more brittle to changes across your model.
 */
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

/**
 * This is more of an information test. It shows you what the behaviour of your
 * tests will be if you enabled the `mockActions` configuration value for the
 * `createStore` call.
 *
 * If you do mock actions, no listeners will be fired.
 */
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

/**
 * This is more of an information test. It shows you what the behaviour of your
 * tests will be if DO NOT enabled the `mockActions` configuration value for the
 * `createStore` call.
 *
 * If you DO NOT mock actions, then your listeners will be fired.
 *
 * This is something to be aware of especially if you are testing the state updates
 * for an `action`. If you have listeners within the same slice of your model that
 * would subsequently update state then you will have those updates too. I feel
 * like this is unlikely to occur in practice though, as you would probably just
 * do all the required state updates within the original action.
 */
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
