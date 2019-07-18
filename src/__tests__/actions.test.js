import { action, createStore } from '../index';

test('deprecated action API does nothing', () => {
  // act
  const store = createStore({
    count: 1,
    increment: state => {
      state.count += 1;
    },
  });

  // assert
  expect(store.getActions().increment).toBeUndefined();
});

test('returning the state has no effect', () => {
  // arrange
  const store = createStore({
    count: 1,
    doNothing: action(state => state),
  });
  const prevState = store.getState();

  // act
  store.getActions().doNothing();

  // assert
  expect(store.getState()).toBe(prevState);
});

test('supports meta data', () => {
  // arrange
  const someMiddlware = () => next => action => {
    if (action && action.type === '@action.foo') {
      expect(action.meta).toEqual({
        foo: 'bar',
        parent: [],
        path: ['foo'],
      });
    }
    return next(action);
  };

  const store = createStore(
    {
      count: 1,
      foo: action(
        (state, payload, { meta }) => {
          expect(meta).toEqual({
            foo: 'bar',
            parent: [],
            path: ['foo'],
            type: '@action.foo',
          });
        },
        {
          meta: {
            foo: 'bar',
          },
        },
      ),
    },
    {
      middleware: [someMiddlware],
    },
  );

  // act
  store.getActions().foo();

  // assert
  expect().toBeUndefined();
});

test('supports runtime meta data', () => {
  // arrange
  const someMiddleware = () => next => action => {
    if (action && action.type === '@action.foo') {
      expect(action.meta).toEqual({
        foo: 'bar',
        name: 'mary',
        age: 30,
        parent: [],
        path: ['foo'],
      });
    }
    return next(action);
  };

  const store = createStore(
    {
      count: 1,
      foo: action(
        (state, payload, { meta }) => {
          expect(meta).toEqual({
            foo: 'bar',
            name: 'mary',
            age: 30,
            parent: [],
            path: ['foo'],
            type: '@action.foo',
          });
        },
        {
          meta: {
            foo: 'bar',
            name: 'bob',
          },
        },
      ),
    },
    {
      middleware: [someMiddleware],
    },
  );

  // act
  store.getActions().foo(undefined, {
    name: 'mary',
    age: 30,
  });

  // assert
  expect().toBeUndefined();
});
