import { action, createStore, computed } from '../src';

test('addModel', () => {
  // arrange
  const store = createStore({
    counter: {
      count: 0,
      increment: action((state) => {
        state.count += 1;
      }),
    },
  });

  // act
  store.addModel('router', {
    path: '/',
    push: action((state, payload) => {
      state.path = payload;
    }),
    url: computed((state) => (name) => {
      return `${state.path}${name}`;
    }),
  });

  // assert
  expect(store.getState().router.path).toBe('/');
  expect(store.getState().router.url('home')).toBe('/home');

  // act
  store.getActions().router.push('/foo');

  // assert
  expect(store.getState().router.path).toBe('/foo');
});

test('addModel replaces an existing model', () => {
  // arrange
  const store = createStore({
    counter: {
      count: 0,
    },
  });

  // act
  store.addModel('counter', {
    count: 1,
  });

  // assert
  expect(store.getState()).toEqual({
    counter: {
      count: 1,
    },
  });
});

test('addModel with initial state that does not match model', () => {
  // arrange
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

  // act
  store.addModel('counter', {
    count: 1,
  });

  // assert
  expect(store.getState()).toEqual({
    counter: {
      count: 1,
    },
    foo: 'bar',
  });
});

test('removeModel', () => {
  // arrange
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

  // act
  store.removeModel('router');

  // assert
  expect(store.getActions().router).toBeUndefined();
  expect(store.getState()).toEqual({
    counter: {
      count: 0,
    },
  });
});

test('removeModel does nothing when model does not exist', () => {
  // arrange
  const store = createStore({
    counter: {
      count: 0,
    },
  });

  // act
  store.removeModel('foo');

  // assert
  expect(store.getState()).toEqual({ counter: { count: 0 } });
});

test('adding and removing model maintains existing state - issue#184', () => {
  // arrange
  const store = createStore({
    counter: {
      count: 0,
      inc: action((state) => {
        state.count += 1;
      }),
    },
  });

  store.getActions().counter.inc(1);

  // act
  store.addModel('router', 'router', {
    path: '/',
  });

  // assert
  expect(store.getState().counter.count).toBe(1);
});
