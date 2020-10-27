import { action, computed, createStore, reducer, thunk } from '../src';

test('empty object in state', () => {
  // ARRANGE
  const model = {
    todos: {
      items: {},
      foo: [],
    },
    bar: null,
  };
  // ACT
  const store = createStore(model);
  // ASSERT
  expect(store.getState()).toEqual({
    todos: {
      items: {},
      foo: [],
    },
    bar: null,
  });
});

test('basic features', () => {
  // ARRANGE
  const model = {
    session: {
      user: undefined,
      login: action((state, user) => {
        state.user = user;
      }),
    },
  };
  // ACT
  const store = createStore(model);
  // ASSERT
  expect(store.getState()).toEqual({
    session: {
      user: undefined,
    },
  });
  // ACT
  store.getActions().session.login({
    name: 'bob',
  });
  // ASSERT
  expect(store.getState()).toEqual({
    session: {
      user: {
        name: 'bob',
      },
    },
  });
});

test('nested action', () => {
  // ARRANGE
  const model = {
    session: {
      user: undefined,
      settings: {
        favouriteColor: 'red',
        setFavouriteColor: action((state, color) => {
          state.favouriteColor = color;
        }),
      },
      login: action(() => undefined),
    },
  };
  // ACT
  const store = createStore(model);
  // ASSERT
  expect(store.getState()).toEqual({
    session: {
      user: undefined,
      settings: {
        favouriteColor: 'red',
      },
    },
  });
  // ACT
  store.getActions().session.settings.setFavouriteColor('blue');
  // ASSERT
  expect(store.getState()).toEqual({
    session: {
      user: undefined,
      settings: {
        favouriteColor: 'blue',
      },
    },
  });
});

test('root action', () => {
  // ARRANGE
  const store = createStore({
    todos: {
      items: { 1: { text: 'foo' } },
    },
    doSomething: action((state) => {
      state.todos.items[2] = { text: 'bar' };
    }),
  });
  // ACT
  store.getActions().doSomething();
  // ASSERT
  const actual = store.getState().todos.items;
  expect(actual).toEqual({ 1: { text: 'foo' }, 2: { text: 'bar' } });
});

test('state with no actions', () => {
  // ARRANGE
  const model = {
    session: {
      user: undefined,
      login: action((state, user) => {
        state.user = user;
      }),
    },
    // No associated actions here
    todos: {
      foo: [],
    },
  };
  // ACT
  const store = createStore(model);
  // ACT
  store.getActions().session.login({
    name: 'bob',
  });
  // ASSERT
  expect(store.getState()).toEqual({
    session: {
      user: {
        name: 'bob',
      },
    },
    todos: {
      foo: [],
    },
  });
});

test('allows custom middleware', (done) => {
  // ARRANGE
  const customMiddleware = () => (next) => (_action) => {
    // ASSERT
    expect(_action.type).toEqual('@action.doFoo');
    next(_action);
    done();
  };
  // ACT
  const store = createStore(
    {
      doFoo: action(() => {}),
    },
    { middleware: [customMiddleware] },
  );
  store.getActions().doFoo();
});

test('allows custom middleware with mockActions=true', () => {
  // ARRANGE
  const customMiddleware = (store) => (next) => (_action) => {
    if (_action.customMiddleware) {
      // Unfortunately 'store' is plain Redux store, not easy-peasy's one.
      // So we have to use string named action listeners.
      next(store.dispatch({ type: 'API_REQUEST' }));
      // here is API interaction etc.
      next(
        store.dispatch({ type: 'API_RESPONSE', payload: { success: true } }),
      );
    }
    next(_action);
  };
  const store = createStore(
    {
      error: false,
      saved: action((state, { success }) => {
        state.error = !success;
      }),
    },
    { middleware: [customMiddleware], mockActions: true },
  );

  // ACT
  store.dispatch({ customMiddleware: 'operateOnAPI' });

  // ASSERT
  expect(store.getMockedActions()).toEqual([
    { type: 'API_REQUEST' },
    { type: 'API_RESPONSE', payload: { success: true } },
    { customMiddleware: 'operateOnAPI' },
  ]);
});

test('allows custom enhancers', () => {
  // ARRANGE
  const _defaultState = { foo: 'bar' };
  const rootReducer = (state = _defaultState) => state;

  // ACT
  createStore(
    {},
    {
      enhancers: [
        (storeCreator) => {
          // ASSERT
          expect(storeCreator).toBeInstanceOf(Function);
          const store = storeCreator(rootReducer);
          expect(store.getState()).toEqual({ foo: 'bar' });
          return storeCreator;
        },
      ],
    },
  );

  // ASSERT
});

test('supports initial state', () => {
  // ARRANGE
  const model = {
    foo: {
      bar: {
        stuff: [1, 2],
      },
      color: 'red',
    },
    baz: 'bob',
  };
  const initialState = {
    foo: {
      bar: {
        stuff: [3, 4],
        quxx: 'qux',
      },
    },
  };
  // ACT
  const store = createStore(model, { initialState });
  // ASSERT
  expect(store.getState()).toEqual({
    foo: {
      bar: {
        stuff: [3, 4],
        quxx: 'qux',
      },
      color: 'red',
    },
    baz: 'bob',
  });
});

test('complex configuration', async () => {
  // ARRANGE
  const wrappedThunk = (fn) =>
    thunk(async (actions, payload, helpers) => {
      try {
        const result = await fn(actions, payload, helpers);
        return result;
      } catch (err) {
        helpers.geStoreActions().error.unexpectedError(err);
        return undefined;
      }
    });

  const store = createStore({
    error: {
      message: undefined,
      unexpectedError: action((state, payload) => {
        state.message = payload.message;
      }),
    },
    session: {
      isInitialised: false,
      initialised: action((state) => {
        state.isInitialised = true;
      }),
      initialise: wrappedThunk(async (actions) => {
        actions.initialised();
        return 'done';
      }),
    },
  });

  // ACT
  const result = await store.getActions().session.initialise();

  // ASSERT
  expect(store.getState().session.isInitialised).toBe(true);
  expect(result).toBe('done');
});

test('redux thunk configured', async () => {
  // ARRANGE
  const model = { foo: 'bar' };
  const store = createStore(model);
  const thunkAction = (payload) => () => Promise.resolve(payload);
  // ACT
  const result = await store.dispatch(thunkAction('foo'));
  // ASSERT
  expect(result).toBe('foo');
});

test('initialState is respected even if not in model', () => {
  // ACT
  const store = createStore(
    {},
    {
      initialState: {
        foo: 'bar',
      },
    },
  );

  // ASSERT
  expect(store.getState().foo).toEqual('bar');
});

test('nested empty model', () => {
  // ARRANGE
  const store = createStore({
    counters: {
      add: action((state) => {
        state[Date.now()] = true;
      }),
    },
  });

  // ACT
  store.getActions().counters.add();

  // ASSERT
  expect(Object.keys(store.getState().counters).length).toBe(1);
});

test('supports non literal objects as state - i.e. classes etc', () => {
  // ARRANGE
  class Person {
    constructor(name, surname) {
      this.name = name;
      this.surname = surname;
    }

    fullName = () => `${this.name} ${this.surname}`;
  }

  // ACT
  const store = createStore({
    person: new Person('bob', 'boberson'),
    changePerson: action((state, person) => {
      state.person = person;
    }),
  });

  // ASSERT
  expect(store.getState().person).toBeInstanceOf(Person);
});

test('support model reconfiguration', () => {
  // ARRANGE
  const store = createStore({
    todos: {
      items: [],
      addTodo: action((state, payload) => {
        state.items.push(payload);
      }),
    },
  });
  store.getActions().todos.addTodo('support hot reloading');

  // ACT
  store.reconfigure({
    todos: {
      items: [],
      addTodo: action((state, payload) => {
        state.items.push(payload);
      }),
      bob: 1,
    },
  });
  store.getActions().todos.addTodo('zing');

  // ASSERT
  expect(store.getState()).toEqual({
    todos: {
      items: ['support hot reloading', 'zing'],
      bob: 1,
    },
  });

  // ACT
  store.reconfigure({
    todos: {
      items: [],
      addTodo: action((state, payload) => {
        state.items.push(payload);
      }),
      removeTodo: action((state) => {
        state.items.pop();
      }),
    },
  });
  store.getActions().todos.removeTodo();

  // ASSERT
  expect(store.getState()).toEqual({
    todos: {
      items: ['support hot reloading'],
      bob: 1,
    },
  });

  // ACT
  store.reconfigure({
    todos: {
      items: [],
      removeTodo: action((state) => {
        state.items.pop();
      }),
    },
  });

  // ASSERT
  expect(store.getActions().todos.addTodo).toBeUndefined();
});

test('mocking actions', () => {
  // ARRANGE
  const store = createStore(
    {
      counter: 0,
      inc: action((state) => {
        state.counter += 1;
      }),
    },
    { mockActions: true },
  );

  // ACT
  store.getActions().inc();

  // ASSERT
  expect(store.getState().counter).toBe(0);
  expect(store.getMockedActions()).toMatchObject([{ type: '@action.inc' }]);

  // ACT
  store.clearMockedActions();

  // ASSERT
  expect(store.getMockedActions()).toEqual([]);
});

test('disableImmer', () => {
  // ARRANGE
  const model = {
    foo: 0,
    setFoo: action((state, foo) => ({ ...state, foo })),
    doubleFoo: computed((state) => state.foo * 2),
  };
  const store = createStore(model, {
    disableImmer: true,
  });

  // ACT
  store.getActions().setFoo(5);

  // ASSERT
  expect(store.getState().doubleFoo).toBe(10);
});

test('disableImmer - nested update', () => {
  // ARRANGE
  const model = {
    nested: {
      foo: 0,
      setFoo: action((state, foo) => ({ ...state, foo })),
    },
  };
  const store = createStore(model, { disableImmer: true });

  // ACT
  store.dispatch.nested.setFoo(5);

  // ASSERT
  expect(store.getState()).toEqual({ nested: { foo: 5 } });
});

test('disableImmer - deeply nested update', () => {
  // ARRANGE
  const model = {
    deeply: {
      nested: {
        foo: 0,
        setFoo: action((state, foo) => ({ ...state, foo })),
      },
    },
  };
  const store = createStore(model, { disableImmer: true });

  // ACT
  store.dispatch.deeply.nested.setFoo(5);

  // ASSERT
  expect(store.getState()).toEqual({ deeply: { nested: { foo: 5 } } });
});

it('disableImmer - nested reducer', () => {
  // ARRANGE
  const store = createStore(
    {
      stuff: {
        counter: reducer((state = 1, _action) => {
          if (_action.type === 'INCREMENT') {
            return state + 1;
          }
          return state;
        }),
      },
    },
    {
      disableImmer: true,
    },
  );

  // ACT
  store.dispatch({ type: 'INCREMENT' });

  // ASSERT
  expect(store.getState()).toEqual({
    stuff: {
      counter: 2,
    },
  });
});
