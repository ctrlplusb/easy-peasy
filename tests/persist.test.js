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

const wait = (time = 18) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });

const createMemoryStorage = (
  initial = {},
  config = { async: false, asyncTime: 18 },
) => {
  const store = initial;
  const { async, asyncTime } = config;
  return {
    setItem: (key, data) => {
      if (async) {
        return wait(asyncTime).then(() => {
          store[key] = data;
        });
      }
      store[key] = data;
      return undefined;
    },
    getItem: (key) => {
      const data = store[key];
      return async ? wait(asyncTime).then(() => data) : data;
    },
    removeItem: (key) => {
      if (async) {
        return wait(asyncTime).then(() => {
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
        address: {
          street: 'oxford rd',
          city: 'london',
        },
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
    address: {
      city: 'edinburgh',
      country: 'england',
    },
  });

  await store.persist.flush();

  const rehydratedStore = makeStore();
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    msg: 'hello universe',
    address: {
      street: 'oxford rd',
      city: 'edinburgh',
      country: 'england',
    },
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
    address: {
      street: 'oxford rd',
      city: 'edinburgh',
    },
  });

  await store.persist.flush();
  const rehydratedStore = makeStore(persistConfig);
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    msg: 'hello universe',
    address: {
      street: 'oxford rd',
      city: 'edinburgh',
    },
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
    address: {
      street: 'oxford rd',
      city: 'edinburgh',
    },
  });

  await store.persist.flush();
  const rehydratedStore = makeStore(persistConfig);
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    msg: 'hello universe',
    address: {
      street: 'oxford rd',
      city: 'edinburgh',
    },
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
    address: {
      street: 'oxford rd',
      city: 'edinburgh',
    },
  });

  await store.persist.flush();
  const rehydratedStore = makeStore(persistConfig);
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 0,
    msg: 'hello world',
    address: {
      street: 'oxford rd',
      city: 'london',
    },
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
    address: {
      street: 'oxford rd',
      city: 'edinburgh',
    },
  });

  await store.persist.flush();
  const rehydratedStore = makeStore(persistConfig);
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    msg: 'hello universe',
    address: {
      street: 'oxford rd',
      city: 'edinburgh',
    },
  });
});

test('allow', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage();
  const persistConfig = { storage: memoryStorage, allow: ['msg'] };
  const store = makeStore(persistConfig);

  // ACT
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
    address: {
      street: 'oxford rd',
      city: 'edinburgh',
    },
  });

  await store.persist.flush();
  const rehydratedStore = makeStore(persistConfig);
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 0,
    msg: 'hello universe',
    address: {
      street: 'oxford rd',
      city: 'london',
    },
  });
});

test('deny', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage();
  const persistConfig = { storage: memoryStorage, deny: ['counter'] };
  const store = makeStore(persistConfig);

  // ACT
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
    address: {
      street: 'oxford rd',
      city: 'edinburgh',
    },
  });

  await store.persist.flush();
  const rehydratedStore = makeStore(persistConfig);
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 0,
    msg: 'hello universe',
    address: {
      street: 'oxford rd',
      city: 'edinburgh',
    },
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

test('nested persists', async () => {
  // ARRANGE
  const makeStore = (config = {}) =>
    createStore(
      persist({
        foo: 'bar',
        nested: persist(
          {
            counter: 0,
            msg: 'hello world',
            change: action((_, payload) => payload),
          },
          config,
        ),
        change: action((state, payload) => payload),
      }),
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
  store.getActions().change({
    foo: 'bob',
    nested: {
      counter: 2,
      msg: 'hello universe',
    },
  });

  await store.persist.flush();
  const rehydratedStore = makeStore({ storage: memoryStorage });
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    foo: 'bob',
    nested: {
      counter: 2,
      msg: 'hello universe',
    },
  });
});

test('overwrite', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage();
  const persistConfig = {
    storage: memoryStorage,
    allow: ['msg'],
    mergeStrategy: 'overwrite',
  };
  const store = makeStore(persistConfig);

  // ACT
  store.getActions().change({
    counter: 1,
    msg: 'hello universe',
    address: {
      street: 'oxford rd',
      city: 'edinburgh',
    },
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
    '[EasyPeasyStore][0]': {
      counter: 1,
      nested: {
        msg: 'hello universe',
      },
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
    '[EasyPeasyStore][0]': {
      counter: 1,
      nested: {
        msg: 'hello universe',
      },
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

test('mergeShallow with conflicting model structure', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage({
    '[EasyPeasyStore][0]': {
      counter: 1,
      conflicting: {
        msg: 'hello universe',
      },
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
        mergeStrategy: 'mergeShallow',
      },
    ),
  );

  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    conflicting: ['hello world', 'foo'],
  });
});

test('mergeDeep with conflicting model structure', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage({
    '[EasyPeasyStore][0]': {
      foo: {
        conflicting: 'baz',
        foo: 'bar',
      },
      conflicting: {
        msg: 'hello universe',
      },
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
      },
    ),
  );

  await rehydratedStore.persist.resolveRehydration();

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
    address: {
      street: 'oxford rd',
      city: 'edinburgh',
    },
  });

  await store.persist.flush();
  const rehydratedStore = makeStore({ storage: memoryStorage });
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    counter: 1,
    msg: 'hello universe',
    address: {
      street: 'oxford rd',
      city: 'edinburgh',
    },
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
    '[EasyPeasyStore][0]': {
      counter: 1,
      msg: 'hello universe',
    },
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
    '[EasyPeasyStore][0]': {
      one: '_ITEM ONE_',
      two: 'item two',
    },
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

test('transformers order', async () => {
  // ARRANGE
  const setTransformer = createTransform(
    (data) => {
      return [...data];
    },
    (data) => {
      return new Set(data);
    },
  );

  const jsonTransformer = createTransform(
    (data) => {
      return JSON.stringify(data);
    },
    (data) => {
      return JSON.parse(data);
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
          transformers: [setTransformer, jsonTransformer],
        },
      ),
    );

  const store = makeStore();

  // ACT
  store.getActions().change({
    one: new Set([1, 2]),
    two: new Set([3, 4]),
  });
  await store.persist.flush();

  // ASSERT
  expect(memoryStorage.store).toEqual({
    '[EasyPeasyStore][0]': {
      one: '[1,2]',
      two: '[3,4]',
    },
  });

  // ACT
  const rehydratedStore = makeStore();
  await rehydratedStore.persist.resolveRehydration();

  // ASSERT
  expect(rehydratedStore.getState()).toEqual({
    one: new Set([1, 2]),
    two: new Set([3, 4]),
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
    address: {
      street: 'oxford rd',
      city: 'edinburgh',
    },
  });
  await store1.persist.flush();
  store2.getActions().change({
    counter: 99,
    msg: 'i am store 2',
    address: {
      street: 'oxford rd',
      city: 'cape town',
    },
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
    address: {
      street: 'oxford rd',
      city: 'edinburgh',
    },
  });
  expect(rehydratedStore2.getState()).toEqual({
    counter: 99,
    msg: 'i am store 2',
    address: {
      street: 'oxford rd',
      city: 'cape town',
    },
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
          todoCount: computed((state) => state.todos.length),
          addTodo: action((state, payload) => {
            state.todos.push(payload);
          }),
          nested: {
            todos: ['write tests'],
            todoCount: computed((state) => state.todos.length),
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
  expect(memoryStorage.store['[EasyPeasyStore][0]'].todoCount).toBeUndefined(); // computed shouldn't be stored
  expect(
    memoryStorage.store['[EasyPeasyStore][0]'].nested.todoCount,
  ).toBeUndefined();
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
    '[EasyPeasyStore][0]': {
      counter: 1,
      msg: 'hello universe',
    },
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
  const addDynamicModel = (store) =>
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
  const addDynamicModel = (store) =>
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

test("multiple changes don't cause concurrent persist operations", async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage(undefined, {
    async: true,
    asyncTime: 80,
  });

  const store = makeStore(
    {
      storage: memoryStorage,
    },
    {
      counter: 0,
      change: action((state, payload) => payload),
    },
    {
      disableImmer: true,
    },
  );

  // ACT + ASSERTS
  store.getActions().change({
    counter: 1,
  });

  await wait(20);

  expect(memoryStorage.store['[EasyPeasyStore][0]']).toBeUndefined();

  store.getActions().change({
    counter: 2,
  });

  await wait(20);

  expect(memoryStorage.store['[EasyPeasyStore][0]']).toBeUndefined();

  store.getActions().change({
    counter: 3,
  });

  await wait(20);

  expect(memoryStorage.store['[EasyPeasyStore][0]']).toBeUndefined();

  store.getActions().change({
    counter: 4,
  });

  await wait(20);

  expect(memoryStorage.store['[EasyPeasyStore][0]']).toBeUndefined();

  store.getActions().change({
    counter: 5,
  });

  await wait(20);

  // Now we have waited 100ms, so the storage should have persisted the first
  // change by now
  expect(memoryStorage.store['[EasyPeasyStore][0]'].counter).toBe(1);

  // It would then fire the last change (i.e. the counter=5 change), which
  // would take 80ms to persist in the configured storage engine
  await wait(20);
  expect(memoryStorage.store['[EasyPeasyStore][0]'].counter).toBe(1);
  await wait(20);
  expect(memoryStorage.store['[EasyPeasyStore][0]'].counter).toBe(1);
  await wait(20);
  expect(memoryStorage.store['[EasyPeasyStore][0]'].counter).toBe(1);
  await wait(30);
  expect(memoryStorage.store['[EasyPeasyStore][0]'].counter).toBe(5);
});

test('store version number change ignores persisted state', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage();

  const model = {
    counter: 0,
    inc: action((state) => {
      state.counter += 1;
    }),
  };

  const store = makeStore({ storage: memoryStorage }, model, {
    version: 1,
  });

  // ACT
  store.getActions().inc();
  await store.persist.flush();

  // ASSERT
  expect(memoryStorage.store['[EasyPeasyStore][1]']).toEqual({
    counter: 1,
  });

  // ACT
  const storeVersion2 = makeStore({ storage: memoryStorage }, model, {
    version: 2,
  });
  await storeVersion2.persist.resolveRehydration();

  // ASSERT
  expect(storeVersion2.getState()).toEqual({
    counter: 0,
  });

  // ACT
  const storeVersion1 = makeStore({ storage: memoryStorage }, model, {
    version: 1,
  });
  await storeVersion1.persist.resolveRehydration();

  // ASSERT
  expect(storeVersion1.getState()).toEqual({
    counter: 1,
  });
});

test('mergeDeepDocs', async () => {
  // ARRANGE
  const memoryStorage = createMemoryStorage({
    '[EasyPeasyStore][0]': {
      address: {
        city: 'cape town',
      },
      flagged: true,
      fruits: ['banana'],
      id: 'one',
      name: 'Wonder Woman',
      counter: null,
    },
  });

  const store = makeStore(
    { storage: memoryStorage },
    {
      animal: 'dolphin',
      address: {
        city: 'london',
        postCode: 'e3 1pq',
      },
      fruits: ['apple'],
      id: 1,
      name: null,
      counter: 20,
    },
  );

  // ACT
  await store.persist.resolveRehydration();

  // ASSERT
  expect(store.getState()).toEqual({
    animal: 'dolphin',
    address: {
      city: 'cape town',
      postCode: 'e3 1pq',
    },
    flagged: true,
    fruits: ['banana'],
    id: 1,
    name: 'Wonder Woman',
    counter: null,
  });
});

test.todo('persist rehydraton with store intialState being set');
