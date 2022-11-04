import { action, createStore, computed } from '../src';

test('addModel', () => {
  // ARRANGE
  const store = createStore({
    counter: {
      count: 0,
      increment: action((state) => {
        state.count += 1;
      }),
    },
  });

  // ACT
  store.addModel('router', {
    path: '/',
    push: action((state, payload) => {
      state.path = payload;
    }),
    url: computed((state) => (name) => `${state.path}${name}`),
  });

  // ASSERT
  expect(store.getState().router.path).toBe('/');
  expect(store.getState().router.url('home')).toBe('/home');

  // ACT
  store.getActions().router.push('/foo');

  // ASSERT
  expect(store.getState().router.path).toBe('/foo');
});

test('addModel replaces an existing model', () => {
  // ARRANGE
  const store = createStore({
    counter: {
      count: 0,
    },
  });

  // ACT
  store.addModel('counter', {
    count: 1,
  });

  // ASSERT
  expect(store.getState()).toEqual({
    counter: {
      count: 1,
    },
  });
});

test('addModel with initial state that does not match model', () => {
  // ARRANGE
  const store = createStore(
    {
      counter: {
        count: 0,
      },
    },
    {
      initialState: { foo: 'bar' },
    },
  );

  // ACT
  store.addModel('counter', {
    count: 1,
  });

  // ASSERT
  expect(store.getState()).toEqual({
    counter: {
      count: 1,
    },
    foo: 'bar',
  });
});

test('removeModel', () => {
  // ARRANGE
  const store = createStore({
    counter: {
      count: 0,
      increment: action((state) => {
        state.count += 1;
      }),
    },
    router: {
      path: '/',
      push: action((state, payload) => {
        state.path = payload;
      }),
    },
  });

  // ACT
  store.removeModel('router');

  // ASSERT
  expect(store.getActions().router).toBeUndefined();
  expect(store.getState()).toEqual({
    counter: {
      count: 0,
    },
  });
});

test('removeModel does nothing when model does not exist', () => {
  // ARRANGE
  const store = createStore({
    counter: {
      count: 0,
    },
  });

  // ACT
  store.removeModel('foo');

  // ASSERT
  expect(store.getState()).toEqual({ counter: { count: 0 } });
});

test('adding and removing model maintains existing state - issue#184', () => {
  // ARRANGE
  const store = createStore({
    counter: {
      count: 0,
      inc: action((state) => {
        state.count += 1;
      }),
    },
  });

  store.getActions().counter.inc(1);

  // ACT
  store.addModel('router', 'router', {
    path: '/',
  });

  // ASSERT
  expect(store.getState().counter.count).toBe(1);
});
