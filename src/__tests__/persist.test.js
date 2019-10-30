import { createStore, action, persist } from '../';

jest.mock('debounce', () => fn => fn);

const createMemoryStorage = (initial = {}, config = { async: false }) => {
  const store = initial;
  const { async } = config;
  return {
    setItem: (key, data) => {
      store[key] = JSON.stringify(data);
      if (async) {
        return Promise.resolve({});
      }
    },
    getItem: key => {
      const data = store[key];
      const result = data !== undefined ? JSON.parse(store[key]) : undefined;
      return async ? Promise.resolve(result) : result;
    },
    removeItem: key => {
      delete store[key];
      return Promise.resolve();
    },
    store,
  };
};

const makeStore = (config = {}) =>
  createStore(
    persist(
      {
        counter: 0,
        msg: 'hello world',
        change: action((_, payload) => {
          console.log(payload);
          return payload;
        }),
      },
      config,
    ),
  );

test('persist and rehydrate', () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage();
  const store = makeStore({ storage: memoryStorage });

  // ACT

  // update the state
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  // create a new store using the same storage
  const rehydratedStore = makeStore({ storage: memoryStorage });

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    msg: 'hello universe',
  });
});

test('whitelist', () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage();
  const store = makeStore({ storage: memoryStorage, whitelist: ['msg'] });

  // ACT

  // update the state
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  // create a new store using the same storage
  const rehydratedStore = makeStore({ storage: memoryStorage });

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 0,
    msg: 'hello universe',
  });
});

test('blacklist', () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage();
  const store = makeStore({ storage: memoryStorage, blacklist: ['counter'] });

  // ACT

  // update the state
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  // create a new store using the same storage
  const rehydratedStore = makeStore({ storage: memoryStorage });

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 0,
    msg: 'hello universe',
  });
});

test('nested', () => {
  // ARRANGE
  const makeStore = (config = {}) =>
    createStore(
      {
        foo: 'bar',
        nested: persist(
          {
            counter: 0,
            msg: 'hello world',
            change: action((_, payload) => payload),
          },
          config,
        ),
      },
      {
        disableImmer: true,
      },
    );
  const memoryStorage = createMemoryStorage();
  const store = makeStore({ storage: memoryStorage });

  // ACT

  // update the state
  store.getActions().nested.change({
    counter: 1,
    msg: 'hello universe',
  });

  // create a new store using the same storage
  const rehydratedStore = makeStore({ storage: memoryStorage });

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    foo: 'bar',
    nested: {
      counter: 1,
      msg: 'hello universe',
    },
  });
});

test('overwrite', () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage();
  const persistConfig = {
    storage: memoryStorage,
    whitelist: ['msg'],
    strategy: 'overwrite',
  };
  const store = makeStore(persistConfig);

  // ACT

  // update the state
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  // create a new store using the same storage
  const rehydratedStore = makeStore(persistConfig);

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    msg: 'hello universe',
  });
});

test('mergeDeep', () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage({
    counter: JSON.stringify(1),
    nested: JSON.stringify({
      msg: 'hello universe',
    }),
  });
  const persistConfig = {
    storage: memoryStorage,
    strategy: 'mergeDeep',
  };

  // ACT
  const rehydratedStore = createStore(
    persist(
      {
        counter: 0,
        nested: {
          msg: 'hello world',
          foo: 'bar',
        },
      },
      persistConfig,
    ),
  );

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    nested: {
      msg: 'hello universe',
      foo: 'bar',
    },
  });
});

test('asynchronous storage', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage(undefined, { async: true });
  const store = makeStore({ storage: memoryStorage });

  // ACT

  // update the state
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  // create a new store using the same storage
  const rehydratedStore = makeStore({ storage: memoryStorage });

  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    msg: 'hello universe',
  });
});
