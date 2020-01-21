import { action, computed, createStore, model, reducer, thunk } from '../index';

test('empty object in state', () => {
  // arrange
  const storeModel = model({
    todos: {
      items: {},
      foo: [],
    },
    bar: null,
  });
  // act
  const store = createStore(storeModel);
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
  const sessionModel = model({
    user: undefined,
    login: action((state, user) => {
      state.user = user;
    }),
  });
  const storeModel = model({
    session: sessionModel,
  });
  // act
  const store = createStore(storeModel);
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
  const storeModel = model({
    session: model({
      user: undefined,
      settings: model({
        favouriteColor: 'red',
        setFavouriteColor: action((state, color) => {
          state.favouriteColor = color;
        }),
      }),
      login: action(() => undefined),
    }),
  });
  // act
  const store = createStore(storeModel);
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
  const store = createStore(
    model({
      todos: {
        items: { 1: { text: 'foo' } },
      },
      doSomething: action(state => {
        state.todos.items[2] = { text: 'bar' };
      }),
    }),
  );
  // act
  store.getActions().doSomething();
  // assert
  const actual = store.getState().todos.items;
  expect(actual).toEqual({ 1: { text: 'foo' }, 2: { text: 'bar' } });
});

test('state with no actions', () => {
  // arrange
  const storeModel = model({
    session: model({
      user: undefined,
      login: action((state, user) => {
        state.user = user;
      }),
    }),
    todos: {
      foo: [],
    },
  });
  // act
  const store = createStore(storeModel);
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
    expect(_action.type).toEqual('@action.doFoo');
    next(_action);
    done();
  };
  // act
  const store = createStore(
    model({
      doFoo: action(() => {}),
    }),
    { middleware: [customMiddleware] },
  );
  store.getActions().doFoo();
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
    model({
      error: false,
      saved: action((state, { success }) => {
        state.error = !success;
      }),
    }),
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
  createStore(model({}), {
    enhancers: [
      storeCreator => {
        // assert
        expect(storeCreator).toBeInstanceOf(Function);
        const store = storeCreator(rootReducer);
        expect(store.getState()).toEqual({ foo: 'bar' });
        return storeCreator;
      },
    ],
  });

  // assert
});

test('supports initial state', () => {
  // arrange
  const storeModel = model({
    foo: {
      bar: {
        stuff: [1, 2],
      },
      color: 'red',
    },
    baz: 'bob',
  });
  const initialState = {
    foo: {
      bar: {
        stuff: [3, 4],
        quxx: 'qux',
      },
    },
  };

  // act
  const store = createStore(storeModel, { initialState });

  // assert
  expect(store.getState()).toEqual({
    foo: {
      bar: {
        stuff: [3, 4],
        quxx: 'qux',
      },
    },
    baz: 'bob',
  });
});

test('complex configuration', async () => {
  // arrange
  const wrappedThunk = fn =>
    thunk(async (actions, payload, helpers) => {
      try {
        const result = await fn(actions, payload, helpers);
        return result;
      } catch (err) {
        helpers.geStoreActions().error.unexpectedError(err);
        return undefined;
      }
    });

  const store = createStore(
    model({
      error: model({
        message: undefined,
        unexpectedError: action((state, payload) => {
          state.message = payload.message;
        }),
      }),
      session: model({
        isInitialised: false,
        initialised: action(state => {
          state.isInitialised = true;
        }),
        initialise: wrappedThunk(async actions => {
          actions.initialised();
          return 'done';
        }),
      }),
    }),
  );

  // act
  const result = await store.getActions().session.initialise();

  // assert
  expect(store.getState().session.isInitialised).toBe(true);
  expect(result).toBe('done');
});

test('redux thunk configured', async () => {
  // arrange
  const storeModel = model({ foo: 'bar' });
  const store = createStore(storeModel);
  const thunkAction = payload => () => Promise.resolve(payload);
  // act
  const result = await store.dispatch(thunkAction('foo'));
  // assert
  expect(result).toBe('foo');
});

test('initialState is respected even if not in model', () => {
  // act
  const store = createStore(model({}), {
    initialState: {
      foo: 'bar',
    },
  });

  // assert
  expect(store.getState().foo).toEqual('bar');
});

test('nested empty model', () => {
  // arrange
  const store = createStore(
    model({
      counters: model({
        add: action(state => {
          console.log(state);
          state[Date.now()] = true;
        }),
      }),
    }),
  );

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

test('support model reconfiguration', () => {
  // arrange
  const store = createStore(
    model({
      todos: model({
        items: [],
        addTodo: action((state, payload) => {
          state.items.push(payload);
        }),
      }),
    }),
  );
  store.getActions().todos.addTodo('support hot reloading');

  // act
  store.reconfigure(
    model({
      todos: model({
        items: [],
        addTodo: action((state, payload) => {
          state.items.push(payload);
        }),
        bob: 1,
      }),
    }),
  );
  store.getActions().todos.addTodo('zing');

  // assert
  expect(store.getState()).toEqual({
    todos: {
      items: ['support hot reloading', 'zing'],
      bob: 1,
    },
  });

  // act
  store.reconfigure(
    model({
      todos: model({
        items: [],
        addTodo: action((state, payload) => {
          state.items.push(payload);
        }),
        removeTodo: action(state => {
          state.items.pop();
        }),
      }),
    }),
  );
  store.getActions().todos.removeTodo();

  // assert
  expect(store.getState()).toEqual({
    todos: {
      items: ['support hot reloading'],
      bob: 1,
    },
  });

  // act
  store.reconfigure(
    model({
      todos: model({
        items: [],
        removeTodo: action(state => {
          state.items.pop();
        }),
      }),
    }),
  );

  // assert
  expect(store.getActions().todos.addTodo).toBeUndefined();
});

test('mocking actions', () => {
  // arrange
  const store = createStore(
    model({
      counter: 0,
      inc: action(state => {
        state.counter += 1;
      }),
    }),
    { mockActions: true },
  );

  // act
  store.getActions().inc();

  // assert
  expect(store.getState().counter).toBe(0);
  expect(store.getMockedActions()).toMatchObject([{ type: '@action.inc' }]);

  // act
  store.clearMockedActions();

  // assert
  expect(store.getMockedActions()).toEqual([]);
});

test('disableImmer', () => {
  // arrange
  const storeModel = model({
    foo: 0,
    setFoo: action((state, foo) => ({ ...state, foo })),
    doubleFoo: computed(state => state.foo * 2),
  });
  const store = createStore(storeModel, {
    disableImmer: true,
  });

  // act
  store.getActions().setFoo(5);

  // assert
  expect(store.getState().doubleFoo).toBe(10);
});

test('disableImmer - nested update', () => {
  // arrange
  const storeModel = model({
    nested: model({
      foo: 0,
      setFoo: action((state, foo) => ({ ...state, foo })),
    }),
  });
  const store = createStore(storeModel, { disableImmer: true });

  // act
  store.dispatch.nested.setFoo(5);

  // assert
  expect(store.getState()).toEqual({ nested: { foo: 5 } });
});

test('disableImmer - deeply nested update', () => {
  // arrange
  const storeModel = model({
    deeply: model({
      nested: model({
        foo: 0,
        setFoo: action((state, foo) => ({ ...state, foo })),
      }),
    }),
  });
  const store = createStore(storeModel, { disableImmer: true });

  // act
  store.dispatch.deeply.nested.setFoo(5);

  // assert
  expect(store.getState()).toEqual({ deeply: { nested: { foo: 5 } } });
});

it('disableImmer - nested reducer', () => {
  // arrange
  const store = createStore(
    model({
      stuff: model({
        counter: reducer((state = 1, _action) => {
          if (_action.type === 'INCREMENT') {
            return state + 1;
          }
          return state;
        }),
      }),
    }),
    {
      disableImmer: true,
    },
  );

  // act
  store.dispatch({ type: 'INCREMENT' });

  // assert
  expect(store.getState()).toEqual({
    stuff: {
      counter: 2,
    },
  });
});
