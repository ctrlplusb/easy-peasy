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
describe('using triggerListener to test listeners', () => {
  /**
   * The following tests show you how to test listener handlers that are action
   * types - i.e. The listener handlers that are registered are going to perform
   * state updates. Similar to how we assert `action` types, for these types
   * of handlers we can simply assert the expected state updates after our
   * handler has executed.
   */
  describe('testing handlers that are an an action type', () => {
    /**
     * In this test our listener is listening to an `action` type. We don't
     * test the behaviour of the target `action`, but rather focus on testing
     * the handler - asserting the state updates that it performs.
     */
    it('testing handler for an action', async () => {
      // arrange
      const model = {
        total: 1,
        add: action((state, payload) => {
          state.total += payload;
        }),
        logs: [],
        listeners: listen(on => {
          on(
            model.add,
            action((state, payload) => {
              state.logs.push(`Added ${payload} to total`);
            }),
          );
        }),
      };

      const store = createStore(model);

      // act
      store.triggerListener(model.listeners, model.add, 10);

      // assert
      expect(store.getState().logs).toEqual(['Added 10 to total']);
    });

    /**
     * In this test our listener is listening to a `thunk` type. We don't
     * test the behaviour of the target `thunk`, but rather focus on testing
     * the handler - asserting the state updates that it performs.
     */
    it('testing handler for a thunk', async () => {
      // arrange
      const model = {
        login: thunk((actions, payload) => {
          // Imagine some logic in here...
        }),
        logs: [],
        listeners: listen(on => {
          on(
            model.login,
            action((state, payload) => {
              state.logs.push(`Login attempt for ${payload.username}`);
            }),
          );
        }),
      };

      const store = createStore(model);

      // act
      await store.triggerListener(model.listeners, model.login, {
        username: 'bob',
        password: 'foo',
      });

      // assert
      expect(store.getState().logs).toEqual(['Login attempt for bob']);
    });

    /**
     * In this test our listener is listening to a `string` action type. This is
     * typically useful when listening to actions that are fired by 3rd party
     * libraries or legacy Redux code - e.g. redux-first-history, which fires
     * actions every time the page route changes.
     */
    it('testing handler for a string action', async () => {
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
  });

  /**
   * The following tests show you how to test listener handlers that are thunk
   * types - i.e. they are expected to perform side effects (e.g. network calls)
   * and/or fire actions.
   */
  describe('testing handlers that are a thunk type', () => {
    /**
     * Within the following tests we will test our thunk handlers whilst enabling
     * the `mockActions` configuration value of our `createStore`. This will
     * ensure that any actions that are fired within our thunk handler will
     * not actually be executed, instead the actions will be logged and are
     * available via the `store.getMockedActions()` call.
     *
     * This is the recommended way to test your thunk handlers.
     */
    describe('with mocking actions', () => {
      /**
       * In this test our listener is listening to an `action` type. We don't
       * test the behaviour of the target `action`, but rather focus on testing
       * the handler - asserting that the expected actions were called with the
       * expected payload.
       */
      it('testing handler for an action', async () => {
        // arrange
        const model = {
          login: action(() => {}),
          log: action(() => {}),
          listeners: listen(on => {
            on(
              model.login,
              thunk(async (actions, payload) => {
                await tick(); // simulating async work
                actions.log(`Attempted login for ${payload.username}`);
              }),
            );
          }),
        };

        const store = createStore(model, {
          mockActions: true,
        });

        // act
        await store.triggerListener(model.listeners, model.login, {
          username: 'bob',
          password: 'foo',
        });

        // assert
        expect(store.getMockedActions()).toEqual([
          {
            type: actionName(model.log),
            payload: 'Attempted login for bob',
          },
        ]);
      });

      /**
       * In this test our listener is listening to a `thunk` type. We don't
       * test the behaviour of the target `thunk`, but rather focus on testing
       * the handler - asserting that the expected actions were called with the
       * expected payload.
       */
      it('testing handler for a thunk', async () => {
        // arrange
        const model = {
          registerSession: thunk(async () => {}),
          log: action(() => {}),
          listeners: listen(on => {
            on(
              model.registerSession,
              thunk(async (actions, payload) => {
                await tick(); // simulating async work
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

      /**
       * In this test our listener is listening to a string action type. We
       * assert that the expected actions were called with the expected payload.
       */
      it('testing handler for a string action', async () => {
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
                await tick(); // simulating async work
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
    });

    /**
     * Within the below tests we will not be mocking any actions. i.e. we will
     * allow the thunk hanlderss to execute naturally. This means that any actions
     * that are called within a thunk will be executed.
     *
     * This provides more of an integration test as you are crossing boundaries,
     * executing actions outside of your thunk.
     */
    describe('without mocking actions', () => {
      it('testing handler for an action', async () => {
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
                await tick(); // simulating async work
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

      it('testing handler for a thunk', async () => {
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
                await tick(); // simulating async work
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

      it('testing handler for a string action', async () => {
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
                await tick(); // simulating async work
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
describe('using triggerListeners to test listeners', () => {
  describe('without mocking actions', () => {
    it('testing handlers for an action', async () => {
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

    it('testing handlers for a thunk', async () => {
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
              await tick(); // simulating async work
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

    it('testing handlers for a string action', async () => {
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
              await tick(); // simulating async work
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
    it('testing handlers for an action', async () => {
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
              await tick(); // simulating async work
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

    it('testing handlers for a thunk', async () => {
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
              await tick(); // simulating async work
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

    it('testing handlers for a string action', async () => {
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
              await tick(); // simulating async work
              actions.log(`thunk fired ${payload.username}`);
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

it('triggering with no matches or invalid action type does nothing', async () => {
  // arrange
  const model = {
    listeners: listen(() => {}),
  };
  const store = createStore(model);

  // act
  await store.triggerListener(model.listeners, 'FOO');
  await store.triggerListener(model.listeners, () => {});
  await store.triggerListeners('FOO');
  await store.triggerListeners(() => {});

  // no errors hopefully 🤞
});
