import * as server from '../src/server';

test('server entry exposes createStore, createTransform, and helpers', () => {
  expect(typeof server.createStore).toBe('function');
  expect(typeof server.createTransform).toBe('function');
  expect(typeof server.action).toBe('function');
  expect(typeof server.actionOn).toBe('function');
  expect(typeof server.computed).toBe('function');
  expect(typeof server.debug).toBe('function');
  expect(typeof server.effectOn).toBe('function');
  expect(typeof server.generic).toBe('function');
  expect(typeof server.persist).toBe('function');
  expect(typeof server.reducer).toBe('function');
  expect(typeof server.thunk).toBe('function');
  expect(typeof server.thunkOn).toBe('function');
});

test('server entry does not expose React hooks or context APIs', () => {
  expect(server.useStoreState).toBeUndefined();
  expect(server.useStoreActions).toBeUndefined();
  expect(server.useStoreDispatch).toBeUndefined();
  expect(server.useStoreRehydrated).toBeUndefined();
  expect(server.useStoreTransition).toBeUndefined();
  expect(server.useStoreDeferredState).toBeUndefined();
  expect(server.useLocalStore).toBeUndefined();
  expect(server.StoreProvider).toBeUndefined();
  expect(server.createContextStore).toBeUndefined();
  expect(server.createTypedHooks).toBeUndefined();
});

test('createStore from server entry produces a working store', () => {
  const { createStore, action } = server;
  const store = createStore({
    count: 0,
    increment: action((state) => {
      state.count += 1;
    }),
  });

  expect(store.getState()).toEqual({ count: 0 });

  store.getActions().increment();
  expect(store.getState()).toEqual({ count: 1 });
});
