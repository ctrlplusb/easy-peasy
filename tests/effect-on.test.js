import {
  createStore,
  action,
  unstable_effectOn,
  thunk,
  thunkOn,
  actionOn,
} from '../src';

const wait = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms));

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

test('fires when the dependencies change', () => {
  // ARRANGE
  let fired = false;
  const store = createStore({
    foo: 'bar',
    todos: [],
    setFoo: action((state, payload) => {
      state.foo = payload;
    }),
    addTodo: action((state, payload) => {
      state.todos.push(payload);
    }),
    onTodosChanged: unstable_effectOn(
      [(state) => state.todos, (state) => state.foo],
      () => {
        fired = true;
      },
    ),
  });

  // ACT
  store.getActions().addTodo('add unstable_effectOn api');

  // ASSERT
  expect(fired).toBe(true);

  // ARRANGE
  fired = false;

  // ACT
  store.getActions().setFoo('baz');

  // ASSERT
  expect(fired).toBe(true);
});

test('does not fire when the dependencies have not changed', () => {
  // ARRANGE
  let fired = false;
  const store = createStore({
    foo: 'bar',
    todos: [],
    setFoo: action((state, payload) => {
      state.foo = payload;
    }),
    onTodosChanged: unstable_effectOn([(state) => state.todos], () => {
      fired = true;
    }),
  });

  // ACT
  store.getActions().setFoo('baz');

  // ASSERT
  expect(fired).toBe(false);
});

test('fires when store dependency changes', () => {
  // ARRANGE
  const store = createStore({
    listener: {
      fired: false,
      setFired: action((state, payload) => {
        state.fired = payload;
      }),
      onTodosChanged: unstable_effectOn(
        [(state, storeState) => storeState.todos],
        (actions) => {
          actions.setFired(true);
        },
      ),
    },
    todos: [],
    addTodo: action((state, payload) => {
      state.todos.push(payload);
    }),
  });

  // ASSERT
  expect(store.getState().listener.fired).toBe(false);

  // ACT
  store.getActions().addTodo('add onEffect api');

  // ASSERT
  expect(store.getState().listener.fired).toBe(true);
});

test('it receives the local actions', () => {
  // ARRANGE
  const store = createStore({
    fired: false,
    todos: [],
    addTodo: action((state, payload) => {
      state.todos.push(payload);
    }),
    setFired: action((state, payload) => {
      state.fired = payload;
    }),
    onTodosChanged: unstable_effectOn([(state) => state.todos], (actions) => {
      actions.setFired(true);
    }),
  });

  // ASSERT
  expect(store.getState().fired).toBe(false);

  // ACT
  store.getActions().addTodo('add onEffect api');

  // ASSERT
  expect(store.getState().fired).toBe(true);
});

test('change argument is as expected', () => {
  // ARRANGE
  let actualChange;
  const store = createStore({
    one: 'one',
    two: 'two',
    setOne: action((state, payload) => {
      state.one = payload;
    }),
    setTwo: action((state, payload) => {
      state.two = payload;
    }),
    onSetOne: thunkOn(
      (actions) => actions.setOne,
      (actions, target) => {
        actions.setTwo(target.payload);
      },
    ),
    onStateChanged: unstable_effectOn(
      [(state) => state.two],
      (actions, change) => {
        actualChange = change;
      },
    ),
  });

  // ACT
  store.getActions().setOne('foo');

  // ASSERT
  expect(actualChange).toEqual({
    prev: ['two'],
    current: ['foo'],
    action: {
      type: '@action.setTwo',
      payload: 'foo',
    },
  });
});

test('getState is exposed in helpers', async () => {
  // ARRANGE
  let actualState;
  const store = createStore({
    nested: {
      string: 'one',
      number: 1,
      setString: action((state, payload) => {
        state.string = payload;
      }),
      onStateChanged: unstable_effectOn(
        [(state) => state.string],
        (actions, change, { getState }) => {
          actualState = getState();
        },
      ),
    },
  });

  // ACT
  store.getActions().nested.setString('two');

  // ASSERT
  expect(actualState).toEqual({
    string: 'two',
    number: 1,
  });
});

test('getStoreState is exposed in helpers', async () => {
  // ARRANGE
  let actualStoreState;
  const store = createStore({
    nested: {
      string: 'one',
      number: 1,
      setString: action((state, payload) => {
        state.string = payload;
      }),
      onStateChanged: unstable_effectOn(
        [(state) => state.string],
        (actions, change, { getStoreState }) => {
          actualStoreState = getStoreState();
        },
      ),
    },
  });

  // ACT
  store.getActions().nested.setString('two');

  // ASSERT
  expect(actualStoreState).toEqual({
    nested: {
      string: 'two',
      number: 1,
    },
  });
});

test('meta values are exposed in helpers', async () => {
  // ARRANGE
  let actualMeta;
  const store = createStore({
    nested: {
      string: 'one',
      number: 1,
      setString: action((state, payload) => {
        state.string = payload;
      }),
      onStateChanged: unstable_effectOn(
        [(state) => state.string],
        (actions, change, { meta }) => {
          actualMeta = meta;
        },
      ),
    },
  });

  // ACT
  store.getActions().nested.setString('two');

  // ASSERT
  expect(actualMeta).toEqual({
    key: 'onStateChanged',
    parent: ['nested'],
    path: ['nested', 'onStateChanged'],
  });
});

test('injections are exposed in helpers', async () => {
  // ARRANGE
  const injections = { foo: 'bar' };
  let actualInjections;
  const store = createStore(
    {
      nested: {
        string: 'one',
        number: 1,
        setString: action((state, payload) => {
          state.string = payload;
        }),
        onStateChanged: unstable_effectOn(
          [(state) => state.string],
          (actions, change, helpers) => {
            actualInjections = helpers.injections;
          },
        ),
      },
    },
    {
      injections,
    },
  );

  // ACT
  await store.getActions().nested.setString('two');

  // ASSERT
  expect(actualInjections).toEqual(injections);
});

test('dispatch is exposed in helpers', async () => {
  // ARRANGE
  let actualDispatch;
  const store = createStore({
    nested: {
      string: 'one',
      number: 1,
      setString: action((state, payload) => {
        state.string = payload;
      }),
      onStateChanged: unstable_effectOn(
        [(state) => state.string],
        (actions, change, helpers) => {
          actualDispatch = helpers.dispatch;
        },
      ),
    },
  });

  // ACT
  await store.getActions().nested.setString('two');

  // ASSERT
  expect(actualDispatch).toBe(store.dispatch);
});

test('getStoreActions are exposed in helpers', async () => {
  // ARRANGE
  const store = createStore({
    nested: {
      string: 'one',
      number: 1,
      setString: action((state, payload) => {
        state.string = payload;
      }),
      onStateChanged: unstable_effectOn(
        [(state) => state.string],
        (actions, change, helpers) => {
          helpers.getStoreActions().nested.setString('three');
        },
      ),
    },
  });

  // ACT
  await store.getActions().nested.setString('two');

  // ASSERT
  expect(store.getState().nested.string).toBe('three');
});

test('dispatches actions to represent a succeeded effect', () => {
  // ARRANGE
  const model = {
    nested: {
      string: 'one',
      number: 1,
      setString: action((state, payload) => {
        state.string = payload;
      }),
      setNumber: action((state, payload) => {
        state.number = payload;
      }),
      onStateChanged: unstable_effectOn(
        [(state) => state.string],
        (actions) => {
          actions.setNumber(2);
        },
      ),
    },
  };
  const trackActions = trackActionsMiddleware();
  const store = createStore(model, { middleware: [trackActions] });
  const payload = 'two';

  // ACT
  store.getActions().nested.setString(payload);

  // ASSERT
  expect(trackActions.actions).toMatchObject([
    { type: '@action.nested.setString', payload: 'two' },
    {
      type: '@effectOn.nested.onStateChanged(start)',
      change: {
        prev: ['one'],
        current: ['two'],
        action: {
          type: '@action.nested.setString',
          payload: 'two',
        },
      },
    },
    { type: '@action.nested.setNumber', payload: 2 },
    {
      type: '@effectOn.nested.onStateChanged(success)',
      change: {
        prev: ['one'],
        current: ['two'],
        action: {
          type: '@action.nested.setString',
          payload: 'two',
        },
      },
    },
  ]);
});

describe('errors', () => {
  test('errors are thrown up through async effects + inner async thunks', async () => {
    // ARRANGE
    const err = new Error('error');
    const model = {
      nested: {
        string: 'one',
        setString: action((state, payload) => {
          state.string = payload;
        }),
        doAsync: thunk(() => {
          throw err;
        }),
        onStateChanged: unstable_effectOn(
          [(state) => state.string],
          async (actions, change) => {
            await actions.doAsync(change.action.payload);
          },
        ),
      },
    };
    const trackActions = trackActionsMiddleware();
    const store = createStore(model, { middleware: [trackActions] });

    // ACT
    try {
      store.getActions().nested.setString('two');
    } catch (_err) {
      // do nothing
    }

    // crude, sorry. we need to wait for the async effect to resolve.
    await wait(10);

    // ASSERT
    expect(trackActions.actions).toMatchObject([
      { type: '@action.nested.setString', payload: 'two' },
      {
        type: '@effectOn.nested.onStateChanged(start)',
        change: {
          prev: ['one'],
          current: ['two'],
          action: {
            type: '@action.nested.setString',
            payload: 'two',
          },
        },
      },
      { type: '@thunk.nested.doAsync(start)', payload: 'two' },
    ]);
  });
});

test('effects cannot be targetted by actionOn', async () => {
  let fired = false;
  const model = {
    nested: {
      string: 'one',
      setString: action((state, payload) => {
        state.string = payload;
      }),
      onStateChanged: unstable_effectOn([(state) => state.string], () => {
        // do nothing
      }),
      invalidActionOn: actionOn(
        (actions) => actions.onStateChanged,
        () => {
          fired = true;
        },
      ),
    },
  };
  const store = createStore(model);

  // ACT
  store.getActions().nested.setString('two');

  // need to ensure no delayed effect occurs
  await wait(10);

  // ASSERT
  expect(fired).toBeFalsy();
});

test('effects cannot be targetted by thunkOn', async () => {
  let fired = false;
  const model = {
    nested: {
      string: 'one',
      setString: action((state, payload) => {
        state.string = payload;
      }),
      onStateChanged: unstable_effectOn([(state) => state.string], () => {
        // do nothing
      }),
      invalidThunkOn: actionOn(
        (actions) => actions.onStateChanged,
        () => {
          fired = true;
        },
      ),
    },
  };
  const store = createStore(model);

  // ACT
  store.getActions().nested.setString('two');

  // need to ensure no delayed effect occurs
  await wait(10);

  // ASSERT
  expect(fired).toBeFalsy();
});

test('synchronous effect with synchronous dispose executes as expected', () => {
  // ARRANGE
  let executionId = 0;
  const executions = [];
  const model = {
    foo: 'bar',
    setFoo: action((state, payload) => {
      state.foo = payload;
    }),
    onFooChange: unstable_effectOn([(state) => state.foo], () => {
      executionId += 1;
      executions.push({ id: executionId, type: 'effect' });
      return () => {
        executions.push({ id: executionId, type: 'dispose' });
      };
    }),
  };
  const store = createStore(model);

  // ACT
  store.getActions().setFoo(1);
  store.getActions().setFoo(2);
  store.getActions().setFoo(3);

  // ASSERT
  expect(executions).toEqual([
    { id: 1, type: 'effect' },
    { id: 1, type: 'dispose' },
    { id: 2, type: 'effect' },
    { id: 2, type: 'dispose' },
    { id: 3, type: 'effect' },
  ]);
});

test('synchronous effect with asynchronous dispose executes as expected', async () => {
  // ARRANGE
  let executionId = 0;
  const executions = [];
  const model = {
    foo: 'bar',
    setFoo: action((state, payload) => {
      state.foo = payload;
    }),
    onFooChange: unstable_effectOn([(state) => state.foo], () => {
      executionId += 1;
      const id = executionId;
      executions.push({ id, type: 'effect' });
      return async () => {
        await wait(1);
        executions.push({ id, type: 'dispose' });
      };
    }),
  };
  const store = createStore(model);

  // ACT
  store.getActions().setFoo(1);
  store.getActions().setFoo(2);
  store.getActions().setFoo(3);

  await wait(5);

  // ASSERT
  expect(executions).toContainEqual({ id: 1, type: 'effect' });
  expect(executions).toContainEqual({ id: 1, type: 'dispose' });
  expect(executions).toContainEqual({ id: 2, type: 'effect' });
  expect(executions).toContainEqual({ id: 2, type: 'dispose' });
  expect(executions).toContainEqual({ id: 3, type: 'effect' });
});
