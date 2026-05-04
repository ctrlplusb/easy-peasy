import { vi } from 'vitest';
import { action, createStore, persist } from '../src';
import { setTransitionFn } from '../src/transitions';

const wait = (time = 18) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
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

const makeModel = () => ({
  counter: 0,
  change: action((_, payload) => payload),
});

afterEach(async () => {
  const { startTransition } = await import('react');
  setTransitionFn(startTransition);
});

test('rehydration replaceState is wrapped in startTransition', async () => {
  const memoryStorage = createMemoryStorage();
  const transitionSpy = vi.fn((callback) => callback());
  setTransitionFn(transitionSpy);

  const initial = createStore(persist(makeModel(), { storage: memoryStorage }));
  initial.getActions().change({ counter: 7 });
  await initial.persist.flush();

  expect(transitionSpy).not.toHaveBeenCalled();

  const rehydrated = createStore(
    persist(makeModel(), { storage: memoryStorage }),
  );
  await rehydrated.persist.resolveRehydration();

  expect(transitionSpy).toHaveBeenCalledTimes(1);
  expect(rehydrated.getState()).toEqual({ counter: 7 });
});

test('startTransition wrapping does not break rehydration ordering or values', async () => {
  const memoryStorage = createMemoryStorage(
    {},
    { async: true, asyncTime: 5 },
  );
  const transitionSpy = vi.fn((callback) => callback());
  setTransitionFn(transitionSpy);

  const initial = createStore(persist(makeModel(), { storage: memoryStorage }));
  initial.getActions().change({ counter: 42 });
  await initial.persist.flush();

  const rehydrated = createStore(
    persist(makeModel(), { storage: memoryStorage }),
  );

  expect(rehydrated.getState()).toEqual({ counter: 0 });

  await rehydrated.persist.resolveRehydration();

  expect(rehydrated.getState()).toEqual({ counter: 42 });
  expect(transitionSpy).toHaveBeenCalledTimes(1);
});

test('startTransition is not invoked when no persisted state exists', async () => {
  const memoryStorage = createMemoryStorage();
  const transitionSpy = vi.fn((callback) => callback());
  setTransitionFn(transitionSpy);

  const store = createStore(persist(makeModel(), { storage: memoryStorage }));
  await store.persist.resolveRehydration();

  expect(transitionSpy).not.toHaveBeenCalled();
});
