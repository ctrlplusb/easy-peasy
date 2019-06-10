import { action, createStore, thunk } from '../index';

it('listening to an action, firing an action', () => {
  // arrange
  const math = {
    sum: 0,
    add: action((state, payload) => {
      state.sum += payload;
    }),
  };
  const audit = {
    logs: [],
    onMathAdd: action(
      (state, payload) => {
        state.logs.push(`Added ${payload}`);
      },
      { listenTo: math.add },
    ),
  };
  const store = createStore({
    math,
    audit,
  });

  // act
  store.dispatch.math.add(10);

  // assert
  expect(store.getState().audit.logs).toEqual(['Added 10']);
});

it('listening to an action, firing a thunk', done => {
  // arrange
  const math = {
    sum: 0,
    add: action((state, payload) => {
      state.sum += payload;
    }),
  };
  const audit = {
    logs: [],
    add: action((state, payload) => {
      // assert
      expect(payload).toBe('Added 10');
      done();
    }),
    onMathAdd: thunk(
      (actions, payload) => {
        actions.add(`Added ${payload}`);
      },
      { listenTo: math.add },
    ),
  };
  const store = createStore({
    math,
    audit,
  });

  // act
  store.dispatch.math.add(10);
});

it('listening to a thunk, firing an action', async () => {
  // arrange
  const math = {
    sum: 0,
    add: thunk(() => {
      // do nothing
    }),
  };
  const audit = {
    logs: [],
    onMathAdd: action(
      (state, payload) => {
        state.logs.push(`Added ${payload}`);
      },
      { listenTo: math.add },
    ),
  };
  const store = createStore({
    math,
    audit,
  });

  // act
  await store.dispatch.math.add(10);

  // assert
  expect(store.getState().audit.logs).toEqual(['Added 10']);
});

it('listening to a thunk, firing a thunk', async done => {
  // arrange
  const math = {
    sum: 0,
    add: thunk(() => {
      // do nothing
    }),
  };
  const audit = {
    logs: [],
    add: action((state, payload) => {
      // assert
      expect(payload).toEqual('Added 10');
      done();
    }),
    onMathAdd: thunk(
      (actions, payload) => {
        actions.add(`Added ${payload}`);
      },
      { listenTo: math.add },
    ),
  };
  const store = createStore({
    math,
    audit,
  });

  // act
  await store.dispatch.math.add(10);
});

it('listening to a string, firing an action', async () => {
  // arrange
  const audit = {
    logs: [],
    onMathAdd: action(
      (state, payload) => {
        state.logs.push(`Added ${payload}`);
      },
      { listenTo: 'MATH_ADD' },
    ),
  };
  const store = createStore({
    audit,
  });

  // act
  await store.dispatch({ type: 'MATH_ADD', payload: 10 });

  // assert
  expect(store.getState().audit.logs).toEqual(['Added 10']);
});

it('listening to an string, firing a thunk', done => {
  // arrange
  const audit = {
    logs: [],
    add: action((state, payload) => {
      // assert
      expect(payload).toBe('Added 10');
      done();
    }),
    onMathAdd: thunk(
      (actions, payload) => {
        actions.add(`Added ${payload}`);
      },
      { listenTo: 'MATH_ADD' },
    ),
  };
  const store = createStore({
    audit,
  });

  // act
  store.dispatch({ type: 'MATH_ADD', payload: 10 });
});
