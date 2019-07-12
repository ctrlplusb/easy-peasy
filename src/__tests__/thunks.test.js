import { action, createStore, thunk, reducer } from '../index';

const resolveAfter = (data, ms) =>
  new Promise(resolve => setTimeout(() => resolve(data), ms));

const trackActionsMiddleware = () => {
  const middleware = () => next => _action => {
    middleware.actions.push(_action);
    return next(_action);
  };
  middleware.actions = [];
  return middleware;
};

test('dispatches actions to represent a succeeded thunk', async () => {
  // arrange
  const model = {
    foo: {
      counter: 0,
      increment: action(state => {
        state.counter += 1;
      }),
      doSomething: thunk(actions => {
        actions.increment();
        return 'did something';
      }),
    },
  };
  const trackActions = trackActionsMiddleware();
  const store = createStore(model, { middleware: [trackActions] });
  const payload = 'hello';
  // act
  const actualResult = await store.getActions().foo.doSomething(payload);
  // assert
  expect(trackActions.actions).toEqual([
    { type: '@thunk.foo.doSomething(start)', payload },
    { type: '@action.foo.increment', payload: undefined },
    {
      type: '@thunk.foo.doSomething(success)',
      payload,
      result: 'did something',
    },
    { type: '@thunk.foo.doSomething', payload, result: 'did something' },
  ]);
  expect(actualResult).toBe('did something');
});

describe('errors', () => {
  test('dispatches actions to represent a failed thunk', async () => {
    // arrange
    const err = new Error('error');
    const model = {
      foo: {
        doSomething: thunk(async () => {
          throw err;
        }),
      },
    };
    const trackActions = trackActionsMiddleware();
    const store = createStore(model, { middleware: [trackActions] });
    const payload = 'a payload';

    try {
      // act
      await store.getActions().foo.doSomething(payload);
    } catch (e) {
      // assert
      expect(trackActions.actions).toEqual([
        { type: '@thunk.foo.doSomething(start)', payload },
        {
          type: '@thunk.foo.doSomething(fail)',
          payload,
          error: err,
        },
        {
          type: '@thunk.foo.doSomething',
          payload,
          error: err,
        },
      ]);

      expect(e).toBe(err);
    }
  });

  test('errors are thrown up through thunks', async () => {
    // arrange
    const err = new Error('error');
    const model = {
      foo: {
        error: thunk(async () => {
          throw err;
        }),
        doSomething: thunk(async actions => {
          await actions.error();
        }),
      },
    };
    const trackActions = trackActionsMiddleware();
    const store = createStore(model, { middleware: [trackActions] });
    const payload = 'a payload';

    try {
      // act
      await store.getActions().foo.doSomething(payload);
    } catch (e) {
      // assert
      expect(trackActions.actions).toEqual([
        { type: '@thunk.foo.doSomething(start)', payload },
        { type: '@thunk.foo.error(start)', payload: undefined },
        {
          type: '@thunk.foo.error(fail)',
          payload: undefined,
          error: err,
        },
        {
          type: '@thunk.foo.error',
          payload: undefined,
          error: err,
        },
        {
          type: '@thunk.foo.doSomething(fail)',
          payload,
          error: err,
        },
        {
          type: '@thunk.foo.doSomething',
          payload,
          error: err,
        },
      ]);

      expect(e).toBe(err);
    }
  });
});

test('async', async () => {
  // arrange
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
  // act
  const store = createStore(model);
  // act
  const result = await store.getActions().session.login({
    username: 'bob',
    password: 'foo',
  });
  // assert
  expect(result).toBe('resolved');
  expect(store.getState()).toEqual({
    session: {
      user: {
        name: 'bob',
      },
    },
  });
});

test('is always promise chainable', done => {
  // arrange
  const model = { doSomething: thunk(() => undefined) };
  const store = createStore(model);
  // act
  store
    .getActions()
    .doSomething()
    .then(done);
});

test('dispatch an action via redux dispatch', async () => {
  // arrange
  const model = {
    session: {
      user: undefined,
      login: thunk((actions, payload, { dispatch }) => {
        dispatch({ type: 'INCREMENT' });
      }),
    },
    counter: reducer((state = 0, action) => {
      switch (action.type) {
        case 'INCREMENT':
          return state + 1;
        default:
          return state;
      }
    }),
  };
  const store = createStore(model);

  // act
  await store.getActions().session.login();

  // assert
  expect(store.getState().counter).toBe(1);
});

test('dispatch another branch action', async () => {
  // arrange
  const model = {
    session: {
      user: undefined,
      login: thunk((actions, payload, { getStoreActions }) => {
        getStoreActions().stats.incrementLoginAttempts();
      }),
    },
    stats: {
      loginAttempts: 0,
      incrementLoginAttempts: action(state => {
        state.loginAttempts += 1;
      }),
    },
  };
  // act
  const store = createStore(model);
  // act
  await store.getActions().session.login();
  // assert
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
  // arrange
  const store = createStore({
    counter: {
      count: 1,
      doSomething: thunk((dispatch, payload, { getState }) => {
        // assert
        expect(getState()).toEqual({ count: 1 });
      }),
    },
  });

  // act
  await store.getActions().counter.doSomething();
});

test('getStoreState is exposed', async () => {
  // arrange
  const store = createStore({
    counter: {
      count: 1,
      doSomething: thunk((dispatch, payload, { getStoreState }) => {
        // assert
        expect(getStoreState()).toEqual({ counter: { count: 1 } });
      }),
    },
  });

  // act
  await store.getActions().counter.doSomething();
});

test('meta values are exposed', async () => {
  // arrange
  let actualMeta;
  const store = createStore({
    foo: {
      doSomething: thunk((dispatch, payload, { meta }) => {
        actualMeta = meta;
      }),
    },
  });

  // act
  await store.getActions().foo.doSomething();

  // assert
  expect(actualMeta).toEqual({
    parent: ['foo'],
    path: ['foo', 'doSomething'],
  });
});

test('injections are exposed', async () => {
  // arrange
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

  // act
  await store.getActions().foo.doSomething();

  // assert
  expect(actualInjections).toEqual(injections);
});
