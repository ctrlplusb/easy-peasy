import { action, createStore, thunk, actionOn, thunkOn } from '../index';

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
    onMathAdd: actionOn(
      (_, storeActions) => storeActions.math.add,
      (state, target) => {
        expect(target.type).toBe('@action.math.add');
        expect(target.payload).toBe(10);
        expect(target.result).toBeUndefined();
        expect(target.error).toBeUndefined();
        expect(target.resolvedTargets).toEqual([target.type]);
        state.logs.push(`Added ${target.payload}`);
      },
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
    onMathAdd: thunkOn(
      (_, storeActions) => storeActions.math.add,
      (actions, target) => {
        expect(target.type).toBe('@action.math.add');
        expect(target.payload).toBe(10);
        expect(target.result).toBeUndefined();
        expect(target.error).toBeUndefined();
        expect(target.resolvedTargets).toEqual([target.type]);
        actions.add(`Added ${target.payload}`);
      },
    ),
  };
  const store = createStore({
    math,
    audit,
  });

  // act
  store.getActions().math.add(10);
});

it('listening to a successful thunk, firing an action', async () => {
  // arrange
  const math = {
    sum: 0,
    add: thunk(async () => {
      const result = await Promise.resolve('foo');
      return result;
    }),
  };
  const audit = {
    logs: [],
    onMathAdd: actionOn(
      (_, storeActions) => storeActions.math.add,
      (state, target) => {
        expect(target.type).toBe('@thunk.math.add');
        expect(target.payload).toBe(10);
        expect(target.result).toBe('foo');
        expect(target.error).toBeUndefined();
        expect(target.type).toBe('@thunk.math.add');
        state.logs.push(`Added ${target.payload}`);
      },
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

it('listening to a failed thunk', async () => {
  // arrange
  const err = new Error('💩');
  const math = {
    sum: 0,
    add: thunk(() => {
      throw err;
    }),
  };
  const audit = {
    logs: [],
    onMathAdd: actionOn(
      (_, storeActions) => storeActions.math.add,
      (state, target) => {
        expect(target.type).toBe('@thunk.math.add');
        expect(target.payload).toBe(10);
        expect(target.result).toBeUndefined();
        expect(target.error).toBe(err);
        expect(target.type).toBe('@thunk.math.add');
        state.logs.push(`Added ${target.payload}`);
      },
    ),
  };
  const store = createStore({
    math,
    audit,
  });

  // act
  try {
    await store.getActions().math.add(10);
  } catch (error) {
    expect(error).toBe(err);
  }

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
    onMathAdd: thunkOn(
      (_, storeActions) => storeActions.math.add,
      (actions, target) => {
        actions.add(`Added ${target.payload}`);
      },
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
    onMathAdd: actionOn(
      () => 'MATH_ADD',
      (state, target) => {
        state.logs.push(`Added ${target.payload}`);
      },
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
    onMathAdd: thunkOn(
      () => 'MATH_ADD',
      (actions, target) => {
        actions.add(`Added ${target.payload}`);
      },
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
    onActions: actionOn(
      actions => [actions.actionTarget, actions.thunkTarget],
      (state, target) => {
        expect(target.resolvedTargets).toEqual([
          '@action.actionTarget',
          '@thunk.thunkTarget',
        ]);
        state.logs.push(target.payload);
      },
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
    onActions: thunkOn(
      actions => [actions.actionTarget, actions.thunkTarget],
      thunkSpy,
    ),
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
      resolvedTargets: ['@action.actionTarget', '@thunk.thunkTarget'],
      result: undefined,
      error: undefined,
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
      type: store.getActions().thunkTarget.type,
      payload: 'thunk payload',
      resolvedTargets: ['@action.actionTarget', '@thunk.thunkTarget'],
      result: undefined,
      error: undefined,
    },
    expect.anything(),
  );
});
