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

it('action listening to multiple actions', async () => {
  // arrange
  const actionTarget = action(() => {});
  const thunkTarget = thunk(() => {});
  const model = {
    logs: [],
    actionTarget,
    thunkTarget,
    onActions: action(
      (state, payload) => {
        state.logs.push(payload);
      },
      { listenTo: [actionTarget, thunkTarget] },
    ),
  };
  const store = createStore(model);

  // act
  store.getActions().actionTarget('action payload');
  await store.getActions().thunkTarget('thunk payload');

  // assert
  expect(store.getState().logs).toEqual(['action payload', 'thunk payload']);
});

it('thunk listening to multiple actions', async () => {
  // arrange
  const thunkSpy = jest.fn();
  const actionTarget = action(() => {});
  const thunkTarget = thunk(() => {});
  const model = {
    logs: [],
    actionTarget,
    thunkTarget,
    onActions: thunk(thunkSpy, { listenTo: [actionTarget, thunkTarget] }),
  };
  const store = createStore(model);

  // act
  store.getActions().actionTarget('action payload');
  await store.getActions().thunkTarget('thunk payload');

  // assert
  await new Promise(resolve => setTimeout(resolve, 100));
  expect(thunkSpy).toHaveBeenCalledTimes(2);
  expect(thunkSpy).toHaveBeenCalledWith(
    expect.anything(),
    'action payload',
    expect.anything(),
  );
  expect(thunkSpy).toHaveBeenCalledWith(
    expect.anything(),
    'thunk payload',
    expect.anything(),
  );
});
