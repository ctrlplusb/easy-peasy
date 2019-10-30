import React from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import {
  createStore,
  action,
  persist,
  RehydrateBoundary,
  StoreProvider,
} from '../';

jest.mock('debounce', () => fn => fn);

const createMemoryStorage = (initial = {}, config = { async: false }) => {
  const store = initial;
  const { async } = config;
  return {
    setItem: (key, data) => {
      store[key] = data;
      if (async) {
        return Promise.resolve({});
      }
    },
    getItem: key => {
      const data = store[key];
      return async ? Promise.resolve(data) : data;
    },
    removeItem: key => {
      delete store[key];
      return Promise.resolve();
    },
    store,
  };
};

const makeStore = (config = {}, model, storeConfig) =>
  createStore(
    persist(
      model || {
        counter: 0,
        msg: 'hello world',
        change: action((_, payload) => {
          return payload;
        }),
      },
      config,
    ),
    storeConfig,
  );

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  process.env.NODE_ENV = 'test';
});

test('default storage', () => {
  // ARRANGE
  const store = makeStore();

  // ACT
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  const rehydratedStore = makeStore();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    msg: 'hello universe',
  });
});

test('local storage', () => {
  // ARRANGE
  const persistConfig = {
    storage: 'localStorage',
  };
  const store = makeStore(persistConfig);

  // ACT
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  const rehydratedStore = makeStore(persistConfig);

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    msg: 'hello universe',
  });
});

test('session storage', () => {
  // ARRANGE
  const persistConfig = {
    storage: 'sessionStorage',
  };
  const store = makeStore(persistConfig);

  // ACT
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  const rehydratedStore = makeStore(persistConfig);

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    msg: 'hello universe',
  });
});

test('invalid storage', () => {
  // ARRANGE
  process.env.NODE_ENV = 'development';
  const persistConfig = {
    storage: 'invalidStorage',
  };
  const store = makeStore(persistConfig);

  // ACT
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  const rehydratedStore = makeStore(persistConfig);

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 0,
    msg: 'hello world',
  });
});

test('custom sync storage', () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage();
  const persistConfig = { storage: memoryStorage };
  const store = makeStore(persistConfig);

  // ACT
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  const rehydratedStore = makeStore(persistConfig);

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    msg: 'hello universe',
  });
});

test('whitelist', () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage();
  const persistConfig = { storage: memoryStorage, whitelist: ['msg'] };
  const store = makeStore(persistConfig);

  // ACT
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  const rehydratedStore = makeStore(persistConfig);

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 0,
    msg: 'hello universe',
  });
});

test('blacklist', () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage();
  const persistConfig = { storage: memoryStorage, blacklist: ['counter'] };
  const store = makeStore(persistConfig);

  // ACT
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  const rehydratedStore = makeStore(persistConfig);

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
  store.getActions().nested.change({
    counter: 1,
    msg: 'hello universe',
  });

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
    mergeStrategy: 'overwrite',
  };
  const store = makeStore(persistConfig);

  // ACT
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  const rehydratedStore = makeStore(persistConfig);

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    msg: 'hello universe',
  });
});

test('mergeDeep', () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage({
    '[EasyPeasyStore]@counter': 1,
    '[EasyPeasyStore]@nested': {
      msg: 'hello universe',
    },
  });

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
      {
        storage: memoryStorage,
        mergeStrategy: 'mergeDeep',
      },
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
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  const rehydratedStore = makeStore({ storage: memoryStorage });

  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    msg: 'hello universe',
  });
});

test('clear', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage(undefined, { async: true });
  const store = makeStore({ storage: memoryStorage });

  // ACT
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  // ASSERT
  expect(memoryStorage.store).toEqual({
    '[EasyPeasyStore]@counter': 1,
    '[EasyPeasyStore]@msg': 'hello universe',
  });

  // ACT
  await store.persist.clear();

  // ASSERT
  expect(memoryStorage.store).toEqual({});
});

test('persistMiddleware', () => {
  // ARRANGE
  const persistConfig = {
    persistMiddleware: [
      (data, key) => {
        if (key === 'upper') {
          return data.toUpperCase();
        }
        if (key === 'lower') {
          return data.toLowerCase();
        }
      },
      data => `_${data}_`,
    ],
  };
  const model = {
    upper: 'one',
    lower: 'two',
    change: action((_, payload) => {
      return payload;
    }),
  };
  const store = makeStore(persistConfig, model);

  // ACT
  store.getActions().change({
    upper: 'foo',
    lower: 'bar',
  });

  const rehydratedStore = makeStore(persistConfig, model);

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    upper: '_FOO_',
    lower: '_bar_',
  });
});

test('rehydrateMiddleware', () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage({
    '[EasyPeasyStore]@upper': 'foo',
    '[EasyPeasyStore]@lower': 'bar',
  });

  // ACT
  const rehydratedStore = makeStore(
    {
      rehydrateMiddleware: [
        (data, key) => {
          if (key === 'upper') {
            return data.toUpperCase();
          }
          if (key === 'lower') {
            return data.toLowerCase();
          }
        },
        data => `_${data}_`,
      ],
      storage: memoryStorage,
    },
    {
      upper: 'one',
      lower: 'two',
    },
  );

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    upper: '_FOO_',
    lower: '_bar_',
  });
});

test('multiple stores', () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage();
  const persistConfig = {
    storage: memoryStorage,
  };
  const store1 = makeStore(persistConfig, undefined, { name: 'Store1' });
  const store2 = makeStore(persistConfig, undefined, { name: 'Store2' });

  // ACT
  store1.getActions().change({
    counter: 1,
    msg: 'i am store 1',
  });
  store2.getActions().change({
    counter: 99,
    msg: 'i am store 2',
  });

  const rehydratedStore1 = makeStore(persistConfig, undefined, {
    name: 'Store1',
  });
  const rehydratedStore2 = makeStore(persistConfig, undefined, {
    name: 'Store2',
  });

  // ASSERT
  expect(rehydratedStore1.getState()).toEqual({
    counter: 1,
    msg: 'i am store 1',
  });
  expect(rehydratedStore2.getState()).toEqual({
    counter: 99,
    msg: 'i am store 2',
  });
});

test('RehydrateBoundary with loading component', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage(undefined, { async: true });
  const store = makeStore({
    storage: memoryStorage,
  });
  const App = () => (
    <StoreProvider store={store}>
      <div>
        <h1>App Title</h1>
        <RehydrateBoundary loading={<p>Loading...</p>}>
          <div>Loaded</div>
        </RehydrateBoundary>
        >
      </div>
    </StoreProvider>
  );
  const wrapper = render(<App />);

  // ASSERT
  expect(wrapper.queryByText('Loading...')).not.toBeNull();
  expect(wrapper.queryByText('Loaded')).toBeNull();

  // ACT
  await act(async () => {
    await store.persist.resolveRehydration();
  });

  // ASSERT
  expect(wrapper.queryByText('Loading...')).toBeNull();
  expect(wrapper.queryByText('Loaded')).not.toBeNull();
});

test('RehydrateBoundary without loading component', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage(undefined, { async: true });
  const store = makeStore({
    storage: memoryStorage,
  });
  const App = () => (
    <StoreProvider store={store}>
      <div>
        <h1>App Title</h1>
        <RehydrateBoundary>
          <div>Loaded</div>
        </RehydrateBoundary>
        >
      </div>
    </StoreProvider>
  );
  const wrapper = render(<App />);

  // ASSERT
  expect(wrapper.queryByText('Loaded')).toBeNull();

  // ACT
  await act(async () => {
    await store.persist.resolveRehydration();
  });

  // ASSERT
  expect(wrapper.queryByText('Loaded')).not.toBeNull();
});
