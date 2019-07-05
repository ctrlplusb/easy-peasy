import { action, createStore, thunk } from '../index';

test('empty object in state', () => {
  // arrange
  const model = {
    todos: {
      items: {},
      foo: [],
    },
    bar: null,
  };
  // act
  const store = createStore(model);
  // assert
  expect(store.getState()).toEqual({
    todos: {
      items: {},
      foo: [],
    },
    bar: null,
  });
});

test('basic features', () => {
  // arrange
  const model = {
    session: {
      user: undefined,
      login: action((state, user) => {
        state.user = user;
      }),
    },
  };
  // act
  const store = createStore(model);
  // assert
  expect(store.getState()).toEqual({
    session: {
      user: undefined,
    },
  });
  // act
  store.getActions().session.login({
    name: 'bob',
  });
  // assert
  expect(store.getState()).toEqual({
    session: {
      user: {
        name: 'bob',
      },
    },
  });
});

test('nested action', () => {
  // arrange
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
  // act
  const store = createStore(model);
  // assert
  expect(store.getState()).toEqual({
    session: {
      user: undefined,
      settings: {
        favouriteColor: 'red',
      },
    },
  });
  // act
  store.getActions().session.settings.setFavouriteColor('blue');
  // assert
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
  // arrange
  const store = createStore({
    todos: {
      items: { 1: { text: 'foo' } },
    },
    doSomething: action(state => {
      state.todos.items[2] = { text: 'bar' };
    }),
  });
  // act
  store.getActions().doSomething();
  // assert
  const actual = store.getState().todos.items;
  expect(actual).toEqual({ 1: { text: 'foo' }, 2: { text: 'bar' } });
});

test('state with no actions', () => {
  // arrange
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
  // act
  const store = createStore(model);
  // act
  store.getActions().session.login({
    name: 'bob',
  });
  // assert
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

test('allows custom middleware', done => {
  // arrange
  const customMiddleware = () => next => _action => {
    // assert
    expect(_action.type).toMatch(/@thunk.logFullState\((started|completed)\)/);
    next(_action);
    done();
  };
  // act
  const store = createStore({}, { middleware: [customMiddleware] });
  store.getActions().logFullState();
});

test('allows custom middleware with mockActions=true', () => {
  // arrange
  const customMiddleware = store => next => _action => {
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

  // act
  store.dispatch({ customMiddleware: 'operateOnAPI' });

  // assert
  expect(store.getMockedActions()).toEqual([
    { type: 'API_REQUEST' },
    { type: 'API_RESPONSE', payload: { success: true } },
    { customMiddleware: 'operateOnAPI' },
  ]);
});

test('allows custom enhancers', () => {
  // arrange
  const defaultState = { foo: 'bar' };
  const rootReducer = (state = defaultState) => state;

  // act
  createStore(
    {},
    {
      enhancers: [
        storeCreator => {
          // assert
          expect(storeCreator).toBeInstanceOf(Function);
          const store = storeCreator(rootReducer);
          expect(store.getState()).toEqual({ foo: 'bar' });
          return storeCreator;
        },
      ],
    },
  );

  // assert
});

test('supports initial state', () => {
  // arrange
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
  // act
  const store = createStore(model, { initialState });
  // assert
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
  const wrappedThunk = fn =>
    thunk(async (actions, payload, helpers) => {
      try {
        return await fn(actions, payload, helpers);
      } catch (err) {
        helpers.dispatch.error.unexpectedError(err);
        return undefined;
      }
    });

  const store = createStore({
    error: {
      message: undefined,
    },
    session: {
      isInitialised: false,
      initialised: action(state => {
        state.isInitialised = true;
      }),
      initialise: wrappedThunk(async actions => {
        actions.initialised();
        return 'done';
      }),
    },
  });

  const result = await store.getActions().session.initialise();
  expect(store.getState().session.isInitialised).toBe(true);
  expect(result).toBe('done');
});

test('redux thunk configured', async () => {
  // arrange
  const model = { foo: 'bar' };
  const store = createStore(model);
  const thunkAction = payload => () => Promise.resolve(payload);
  // act
  const result = await store.dispatch(thunkAction('foo'));
  // assert
  expect(result).toBe('foo');
});

test('initialState is respected even if not in model', () => {
  // act
  const store = createStore(
    {},
    {
      initialState: {
        foo: 'bar',
      },
    },
  );

  // assert
  expect(store.getState().foo).toEqual('bar');
});

test('nested empty model', () => {
  // arrange
  const store = createStore({
    counters: {
      add: action(state => {
        state[Date.now()] = true;
      }),
    },
  });

  // act
  store.getActions().counters.add();

  // assert
  expect(Object.keys(store.getState().counters).length).toBe(1);
});

test('supports non literal objects as state - i.e. classes etc', () => {
  // arrange
  class Person {
    constructor(name, surname) {
      this.name = name;
      this.surname = surname;
    }

    fullName = () => `${this.name} ${this.surname}`;
  }

  // act
  const store = createStore({
    person: new Person('bob', 'boberson'),
    changePerson: action((state, person) => {
      state.person = person;
    }),
  });

  // assert
  expect(store.getState().person).toBeInstanceOf(Person);
});
