import React from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import {
  action,
  computed,
  createStore,
  createTransform,
  persist,
  StoreProvider,
  useStoreRehydrated,
  createContextStore,
} from '../src';

// jest.mock('debounce', () => fn => {
//   const wrappedFn = (...args) => fn(...args);
//   wrappedFn.flush = () =>
//   return wrappedFn;
// });

// jest.useFakeTimers();

const wait = () =>
  new Promise(resolve => {
    setTimeout(() => resolve(), 20);
  });

const createMemoryStorage = (initial = {}, config = { async: false }) => {
  const store = initial;
  const { async } = config;
  return {
    setItem: (key, data) => {
      if (async) {
        return wait().then(() => {
          store[key] = data;
        });
      }
      store[key] = data;
      return undefined;
    },
    getItem: key => {
      const data = store[key];
      return async ? wait().then(() => data) : data;
    },
    removeItem: key => {
      if (async) {
        return wait().then(() => {
          delete store[key];
        });
      }
      delete store[key];
      return undefined;
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

test('default storage', async () => {
  // ARRANGE
  const store = makeStore();

  // ACT
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  await store.persist.flush();
  const rehydratedStore = makeStore();
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    msg: 'hello universe',
  });
});

test('local storage', async () => {
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

  await store.persist.flush();
  const rehydratedStore = makeStore(persistConfig);
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    msg: 'hello universe',
  });
});

test('session storage', async () => {
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

  await store.persist.flush();
  const rehydratedStore = makeStore(persistConfig);
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    msg: 'hello universe',
  });
});

test('invalid storage', async () => {
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

  await store.persist.flush();
  const rehydratedStore = makeStore(persistConfig);
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 0,
    msg: 'hello world',
  });
});

test('custom sync storage', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage();
  const persistConfig = { storage: memoryStorage };
  const store = makeStore(persistConfig);

  // ACT
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  await store.persist.flush();
  const rehydratedStore = makeStore(persistConfig);
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    msg: 'hello universe',
  });
});

test('whitelist', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage();
  const persistConfig = { storage: memoryStorage, whitelist: ['msg'] };
  const store = makeStore(persistConfig);

  // ACT
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  await store.persist.flush();
  const rehydratedStore = makeStore(persistConfig);
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 0,
    msg: 'hello universe',
  });
});

test('blacklist', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage();
  const persistConfig = { storage: memoryStorage, blacklist: ['counter'] };
  const store = makeStore(persistConfig);

  // ACT
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  await store.persist.flush();
  const rehydratedStore = makeStore(persistConfig);
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 0,
    msg: 'hello universe',
  });
});

test('nested', async () => {
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

  await store.persist.flush();
  const rehydratedStore = makeStore({ storage: memoryStorage });
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    foo: 'bar',
    nested: {
      counter: 1,
      msg: 'hello universe',
    },
  });
});

test('overwrite', async () => {
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

  await store.persist.flush();
  const rehydratedStore = makeStore(persistConfig);
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    msg: 'hello universe',
  });
});

test('mergeDeep', async () => {
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
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    nested: {
      msg: 'hello universe',
      foo: 'bar',
    },
  });
});

test('mergeDeep with extended model structure', async () => {
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
        extended: {
          qux: 'quxx',
        },
      },
      {
        storage: memoryStorage,
        mergeStrategy: 'mergeDeep',
      },
    ),
  );
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    nested: {
      msg: 'hello universe',
      foo: 'bar',
    },
    extended: {
      qux: 'quxx',
    },
  });
});

test('merge with conflicting model structure', () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage({
    '[EasyPeasyStore]@counter': 1,
    '[EasyPeasyStore]@conflicting': {
      msg: 'hello universe',
    },
  });

  // ACT
  const rehydratedStore = createStore(
    persist(
      {
        counter: 0,
        conflicting: ['hello world', 'foo'],
      },
      {
        storage: memoryStorage,
        mergeStrategy: 'merge',
      },
    ),
  );

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    conflicting: ['hello world', 'foo'],
  });
});

test('mergeDeep with conflicting model structure', () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage({
    '[EasyPeasyStore]@foo': {
      conflicting: 'baz',
      foo: 'bar',
    },
    '[EasyPeasyStore]@conflicting': {
      msg: 'hello universe',
    },
  });

  // ACT
  const rehydratedStore = createStore(
    persist(
      {
        foo: {
          conflicting: 13,
          foo: 'baz',
        },
        conflicting: ['hello world', 'foo'],
      },
      {
        storage: memoryStorage,
        mergeStrategy: 'mergeDeep',
      },
    ),
  );

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    foo: {
      conflicting: 13,
      foo: 'bar',
    },
    conflicting: ['hello world', 'foo'],
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

  await store.persist.flush();
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
  await store.persist.flush();

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

test('transformers', async () => {
  // ARRANGE
  const upperCaseTransformer = createTransform(
    (data, key) => {
      expect(key).toBe('one');
      return data.toUpperCase();
    },
    (data, key) => {
      expect(key).toBe('one');
      return data.toLowerCase();
    },
    {
      whitelist: ['one'],
    },
  );

  const padTransformer = createTransform(
    (data, key) => {
      expect(key).toBe('one');
      return `_${data}_`;
    },
    (data, key) => {
      expect(key).toBe('one');
      return data.substr(1, data.length - 2);
    },
    {
      blacklist: ['two'],
    },
  );

  const memoryStorage = createMemoryStorage();

  const makeStore = () =>
    createStore(
      persist(
        {
          one: null,
          two: null,
          change: action((_, payload) => {
            return payload;
          }),
        },
        {
          storage: memoryStorage,
          transformers: [upperCaseTransformer, padTransformer],
        },
      ),
    );

  const store = makeStore();

  // ACT
  store.getActions().change({
    one: 'item one',
    two: 'item two',
  });
  await store.persist.flush();

  // ASSERT
  expect(memoryStorage.store).toEqual({
    '[EasyPeasyStore]@one': '_ITEM ONE_',
    '[EasyPeasyStore]@two': 'item two',
  });

  // ACT
  const rehydratedStore = makeStore();
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    one: 'item one',
    two: 'item two',
  });
});

test('multiple stores', async () => {
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
  await store1.persist.flush();
  store2.getActions().change({
    counter: 99,
    msg: 'i am store 2',
  });
  await store2.persist.flush();

  const rehydratedStore1 = makeStore(persistConfig, undefined, {
    name: 'Store1',
  });
  await rehydratedStore1.persist.resolveRehydration();
  const rehydratedStore2 = makeStore(persistConfig, undefined, {
    name: 'Store2',
  });
  await rehydratedStore2.persist.resolveRehydration();

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

test('useStoreRehydrated', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage(undefined, { async: true });
  const store = makeStore({
    storage: memoryStorage,
  });
  const App = () => {
    const rehydrated = useStoreRehydrated();
    return (
      <div>
        <h1>App Title</h1>
        {rehydrated ? <div>Loaded</div> : <p>Loading...</p>}
      </div>
    );
  };
  const wrapper = render(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>,
  );

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

test('useStoreRehydrated + createContextStore', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage(undefined, { async: true });
  const store = makeStore({
    storage: memoryStorage,
  });

  const MyContextStore = createContextStore({
    foo: 'bar',
  });

  const App = () => {
    const rehydrated = MyContextStore.useStoreRehydrated();
    return (
      <div>
        <h1>App Title</h1>
        {rehydrated ? <div>Loaded</div> : <p>Loading...</p>}
      </div>
    );
  };

  const wrapper = render(
    <MyContextStore.Provider>
      <App />
    </MyContextStore.Provider>,
  );

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

test('computed properties', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage();
  const makeStore = () =>
    createStore(
      persist(
        {
          todos: ['write tests'],
          todoCount: computed(state => state.todos.length),
          addTodo: action((state, payload) => {
            state.todos.push(payload);
          }),
          nested: {
            todos: ['write tests'],
            todoCount: computed(state => state.todos.length),
            addTodo: action((state, payload) => {
              state.todos.push(payload);
            }),
          },
        },
        { storage: memoryStorage },
      ),
    );
  const store = makeStore();

  // ACT
  store.getActions().addTodo('write more tests');
  store.getActions().nested.addTodo('write more tests');

  await store.persist.flush();
  const rehydratedStore = makeStore();
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    todos: ['write tests', 'write more tests'],
    todoCount: 2,
    nested: {
      todos: ['write tests', 'write more tests'],
      todoCount: 2,
    },
  });
});

test('flush', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage(undefined, { async: true });
  const store = makeStore({ storage: memoryStorage });

  // ACT
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
  });

  await store.persist.flush();

  // ASSERT
  expect(memoryStorage.store).toEqual({
    '[EasyPeasyStore]@counter': 1,
    '[EasyPeasyStore]@msg': 'hello universe',
  });
});

test('dynamic model with sync storage', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage();
  // eslint-disable-next-line no-shadow
  const makeStore = () =>
    createStore({
      todos: persist(
        {
          items: ['foo', 'bar'],
        },
        { storage: memoryStorage },
      ),
    });
  const addDynamicModel = store => {
    store.addModel(
      'foo',
      persist(
        {
          msg: 'baz',
          changeMessage: action((state, payload) => {
            state.msg = payload;
          }),
        },
        { storage: memoryStorage },
      ),
    );
  };
  const store = makeStore();

  // ACT
  addDynamicModel(store);
  store.getActions().foo.changeMessage('bob');

  await store.persist.flush();
  const rehydratedStore = makeStore();
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    todos: {
      items: ['foo', 'bar'],
    },
  });

  // ACT
  addDynamicModel(rehydratedStore);
  expect(rehydratedStore.getState()).toEqual({
    todos: {
      items: ['foo', 'bar'],
    },
    foo: {
      msg: 'bob',
    },
  });
});

test('dynamic model with async storage', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage(undefined, { async: true });
  // eslint-disable-next-line no-shadow
  const makeStore = () =>
    createStore({
      todos: persist(
        {
          items: ['foo', 'bar'],
        },
        { storage: memoryStorage },
      ),
    });
  const addDynamicModel = store =>
    store.addModel(
      'foo',
      persist(
        {
          msg: 'baz',
          changeMessage: action((state, payload) => {
            state.msg = payload;
          }),
        },
        { storage: memoryStorage },
      ),
    );
  const store = makeStore();

  // ACT
  addDynamicModel(store);

  store.getActions().foo.changeMessage('bob');

  await store.persist.flush();
  const rehydratedStore = makeStore();
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    todos: {
      items: ['foo', 'bar'],
    },
  });

  // ACT
  const { resolveRehydration } = addDynamicModel(rehydratedStore);
  await resolveRehydration();
  // 👆 note how we await the returned promise

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    todos: {
      items: ['foo', 'bar'],
    },
    foo: {
      msg: 'bob',
    },
  });
});
