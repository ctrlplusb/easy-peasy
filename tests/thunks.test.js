import { action, createStore, thunk, reducer } from '../src';

const resolveAfter = (data, ms) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(data), ms);
  });

const trackActionsMiddleware = () => {
  const middleware = () => (next) => (_action) => {
    if (_action != null && typeof _action === 'object') {
      middleware.actions.push(_action);
    }
    return next(_action);
  };
  middleware.actions = [];
  return middleware;
};

test('dispatches actions to represent a succeeded thunk', () => {
  // ARRANGE
  const model = {
    foo: {
      counter: 0,
      increment: action((state) => {
        state.counter += 1;
      }),
      doSomething: thunk((actions) => {
        actions.increment();
        return 'did something';
      }),
    },
  };
  const trackActions = trackActionsMiddleware();
  const store = createStore(model, { middleware: [trackActions] });
  const payload = 'hello';
  // ACT
  const actualResult = store.getActions().foo.doSomething(payload);
  // ASSERT
  expect(trackActions.actions).toMatchObject([
    { type: '@thunk.foo.doSomething(start)', payload },
    { type: '@action.foo.increment', payload: undefined },
    {
      type: '@thunk.foo.doSomething(success)',
      payload,
      result: 'did something',
    },
  ]);
  expect(actualResult).toBe('did something');
});

describe('errors', () => {
  test('dispatches actions to represent a failed thunk', async () => {
    // ARRANGE
    const err = new Error('error');
    const model = {
      foo: {
        doSomething: thunk(async (actions, payload, { fail }) => {
          fail(err);
        }),
      },
    };
    const trackActions = trackActionsMiddleware();
    const store = createStore(model, { middleware: [trackActions] });
    const payload = 'a payload';

    try {
      // ACT
      await store.getActions().foo.doSomething(payload);
    } catch (e) {
      // ASSERT
      expect(trackActions.actions).toEqual([
        { type: '@thunk.foo.doSomething(start)', payload },
        {
          type: '@thunk.foo.doSomething(fail)',
          payload,
          error: err,
        },
      ]);

      expect(e).toBe(err);
    }
  });

  test('errors are thrown up through thunks', async () => {
    // ARRANGE
    const err = new Error('error');
    const model = {
      foo: {
        error: thunk(async () => {
          throw err;
        }),
        doSomething: thunk(async (actions) => {
          await actions.error();
        }),
      },
    };
    const trackActions = trackActionsMiddleware();
    const store = createStore(model, { middleware: [trackActions] });
    const payload = 'a payload';

    try {
      // ACT
      await store.getActions().foo.doSomething(payload);
    } catch (e) {
      // ASSERT
      expect(trackActions.actions).toEqual([
        { type: '@thunk.foo.doSomething(start)', payload },
        { type: '@thunk.foo.error(start)', payload: undefined },
      ]);

      expect(e).toBe(err);
    }
  });
});

test('async', async () => {
  // ARRANGE
  const model = {
    session: {
      user: undefined,
      loginSucceeded: action((state, payload) => {
        state.user = payload;
      }),
      login: thunk(async (actions, payload, { getState }) => {
        expect(payload).toEqual({
          username: 'bob',
          password: 'foo',
        });
        const user = await resolveAfter({ name: 'bob' }, 15);
        actions.loginSucceeded(user);
        expect(getState()).toEqual({
          user: {
            name: 'bob',
          },
        });
        return 'resolved';
      }),
    },
  };
  // ACT
  const store = createStore(model);
  // ACT
  const result = await store.getActions().session.login({
    username: 'bob',
    password: 'foo',
  });
  // ASSERT
  expect(result).toBe('resolved');
  expect(store.getState()).toEqual({
    session: {
      user: {
        name: 'bob',
      },
    },
  });
});

test('dispatch an action via redux dispatch', async () => {
  // ARRANGE
  const model = {
    session: {
      user: undefined,
      login: thunk((actions, payload, { dispatch }) => {
        dispatch({ type: 'INCREMENT' });
      }),
    },
    counter: reducer((state = 0, incomingAction = {}) => {
      switch (incomingAction.type) {
        case 'INCREMENT':
          return state + 1;
        default:
          return state;
      }
    }),
  };
  const store = createStore(model);

  // ACT
  await store.getActions().session.login();

  // ASSERT
  expect(store.getState().counter).toBe(1);
});

test('dispatch another branch action', async () => {
  // ARRANGE
  const model = {
    session: {
      user: undefined,
      login: thunk((actions, payload, { getStoreActions }) => {
        getStoreActions().stats.incrementLoginAttempts();
      }),
    },
    stats: {
      loginAttempts: 0,
      incrementLoginAttempts: action((state) => {
        state.loginAttempts += 1;
      }),
    },
  };
  // ACT
  const store = createStore(model);
  // ACT
  await store.getActions().session.login();
  // ASSERT
  expect(store.getState()).toEqual({
    session: {
      user: undefined,
    },
    stats: {
      loginAttempts: 1,
    },
  });
});

test('getState is exposed', async () => {
  // ARRANGE
  const store = createStore({
    counter: {
      count: 1,
      doSomething: thunk((dispatch, payload, { getState }) => {
        // ASSERT
        expect(getState()).toEqual({ count: 1 });
      }),
    },
  });

  // ACT
  await store.getActions().counter.doSomething();
});

test('getStoreState is exposed', async () => {
  // ARRANGE
  const store = createStore({
    counter: {
      count: 1,
      doSomething: thunk((dispatch, payload, { getStoreState }) => {
        // ASSERT
        expect(getStoreState()).toEqual({ counter: { count: 1 } });
      }),
    },
  });

  // ACT
  await store.getActions().counter.doSomething();
});

test('meta values are exposed', async () => {
  // ARRANGE
  let actualMeta;
  const store = createStore({
    foo: {
      doSomething: thunk((dispatch, payload, { meta }) => {
        actualMeta = meta;
      }),
    },
  });

  // ACT
  await store.getActions().foo.doSomething();

  // ASSERT
  expect(actualMeta).toEqual({
    key: 'doSomething',
    parent: ['foo'],
    path: ['foo', 'doSomething'],
  });
});

test('injections are exposed', async () => {
  // ARRANGE
  const injections = { foo: 'bar' };
  let actualInjections;
  const store = createStore(
    {
      foo: {
        doSomething: thunk((dispatch, payload, helpers) => {
          actualInjections = helpers.injections;
        }),
      },
    },
    {
      injections,
    },
  );

  // ACT
  await store.getActions().foo.doSomething();

  // ASSERT
  expect(actualInjections).toEqual(injections);
});
