import {
  action,
  createStore,
  thunk,
  listenerAction,
  listenerThunk,
} from '../index';

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
    onMathAdd: listenerAction(
      (state, target) => {
        state.logs.push(`Added ${target.payload}`);
      },
      (_, storeActions) => storeActions.math.add,
    ),
  };
  const store = createStore({
    math,
    audit,
  });

  // act
  store.getActions().math.add(10);

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
    onMathAdd: listenerThunk(
      (actions, target) => {
        actions.add(`Added ${target.payload}`);
      },
      (_, storeActions) => storeActions.math.add,
    ),
  };
  const store = createStore({
    math,
    audit,
  });

  // act
  store.getActions().math.add(10);
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
    onMathAdd: listenerAction(
      (state, target) => {
        state.logs.push(`Added ${target.payload}`);
      },
      (_, storeActions) => storeActions.math.add,
    ),
  };
  const store = createStore({
    math,
    audit,
  });

  // act
  await store.getActions().math.add(10);

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
    onMathAdd: listenerThunk(
      (actions, target) => {
        actions.add(`Added ${target.payload}`);
      },
      (_, storeActions) => storeActions.math.add,
    ),
  };
  const store = createStore({
    math,
    audit,
  });

  // act
  await store.getActions().math.add(10);
});

it('listening to a string, firing an action', async () => {
  // arrange
  const audit = {
    logs: [],
    onMathAdd: listenerAction(
      (state, target) => {
        state.logs.push(`Added ${target.payload}`);
      },
      () => 'MATH_ADD',
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
    onMathAdd: listenerThunk(
      (actions, target) => {
        actions.add(`Added ${target.payload}`);
      },
      () => 'MATH_ADD',
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
  const model = {
    logs: [],
    actionTarget: action(() => {}),
    thunkTarget: thunk(() => {}),
    onActions: listenerAction(
      (state, target) => {
        state.logs.push(target.payload);
      },
      actions => [actions.actionTarget, actions.thunkTarget],
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
  const model = {
    logs: [],
    actionTarget: action(() => {}),
    thunkTarget: thunk(() => {}),
    onActions: listenerThunk(thunkSpy, actions => [
      actions.actionTarget,
      actions.thunkTarget,
    ]),
  };
  const store = createStore(model);

  // act
  store.getActions().actionTarget('action payload');

  // assert
  await new Promise(resolve => setTimeout(resolve, 10));
  expect(thunkSpy).toHaveBeenCalledTimes(1);
  expect(thunkSpy).toHaveBeenCalledWith(
    expect.anything(),
    {
      type: store.getActions().actionTarget.type,
      payload: 'action payload',
    },
    expect.anything(),
  );

  // act
  await store.getActions().thunkTarget('thunk payload');
  await new Promise(resolve => setTimeout(resolve, 10));

  // assert
  expect(thunkSpy).toHaveBeenCalledTimes(2);
  expect(thunkSpy).toHaveBeenLastCalledWith(
    expect.anything(),
    {
      type: store.getActions().thunkTarget.completedType,
      payload: 'thunk payload',
    },
    expect.anything(),
  );
});
