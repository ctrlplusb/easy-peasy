import { action, createStore, thunk, actionOn, thunkOn } from '../src';

const wait = (time = 18) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

it('listening to an action, firing an action', () => {
  // ARRANGE
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

  // ACT
  store.getActions().math.add(10);

  // ASSERT
  expect(store.getState().audit.logs).toEqual(['Added 10']);
});

it('listening to an action, firing a thunk', (done) => {
  // ARRANGE
  const math = {
    sum: 0,
    add: action((state, payload) => {
      state.sum += payload;
    }),
  };
  const audit = {
    logs: [],
    add: action((state, payload) => {
      // ASSERT
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

  // ACT
  store.getActions().math.add(10);
});

it('listening to a successful thunk, firing an action', async () => {
  // ARRANGE
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
        expect(target.type).toBe('@thunk.math.add(success)');
        expect(target.payload).toBe(10);
        expect(target.result).toBe('foo');
        expect(target.error).toBeUndefined();
        state.logs.push(`Added ${target.payload}`);
      },
    ),
  };
  const store = createStore({
    math,
    audit,
  });

  // ACT
  await store.getActions().math.add(10);

  // ASSERT
  expect(store.getState().audit.logs).toEqual(['Added 10']);
});

it('listening to a successful or failed thunk, firing an action', async () => {
  // ARRANGE
  let actualTarget;

  const store = createStore({
    math: {
      sum: 0,
      add: thunk(async (actions, payload, helpers) => {
        if (payload === 7) {
          helpers.fail('💩');
          return undefined;
        }
        return 'foo';
      }),
    },
    audit: {
      logs: [],
      onMathAdd: actionOn(
        (_, storeActions) => [
          storeActions.math.add,
          storeActions.math.add.failType,
        ],
        (state, target) => {
          actualTarget = target;
          if (target.error) {
            state.logs.push(`Failed to add ${target.payload}`);
          } else {
            state.logs.push(`Added ${target.payload}`);
          }
        },
      ),
    },
  });

  // ACT
  await store.getActions().math.add(10);

  // ASSERT
  expect(actualTarget.type).toBe('@thunk.math.add(success)');
  expect(actualTarget.payload).toBe(10);
  expect(actualTarget.result).toBe('foo');
  expect(actualTarget.error).toBeUndefined();
  expect(store.getState().audit.logs).toEqual(['Added 10']);

  // ACT
  await store.getActions().math.add(7);

  // ASSERT
  expect(actualTarget.type).toBe('@thunk.math.add(fail)');
  expect(actualTarget.payload).toBe(7);
  expect(actualTarget.result).toBeUndefined();
  expect(actualTarget.error).toBe('💩');
  expect(store.getState().audit.logs).toEqual(['Added 10', 'Failed to add 7']);
});

it('listening to a failed thunk', async () => {
  // ARRANGE
  const err = new Error('💩');
  const math = {
    sum: 0,
    add: thunk((actions, payload, { fail }) => {
      fail(err);
    }),
  };
  const audit = {
    logs: [],
    onMathAdd: actionOn(
      (_, storeActions) => storeActions.math.add.failType,
      (state, target) => {
        expect(target.type).toBe('@thunk.math.add(fail)');
        expect(target.payload).toBe(10);
        expect(target.result).toBeUndefined();
        expect(target.error).toBe(err);
        state.logs.push(`Added ${target.payload}`);
      },
    ),
  };
  const store = createStore({
    math,
    audit,
  });

  // ACT
  try {
    await store.getActions().math.add(10);
  } catch (error) {
    expect(error).toBe(err);
  }

  // ASSERT
  expect(store.getState().audit.logs).toEqual(['Added 10']);
});

it('listening to a thunk, firing a thunk', (done) => {
  // ARRANGE
  const math = {
    sum: 0,
    add: thunk(() => {
      // do nothing
    }),
  };
  const audit = {
    logs: [],
    add: action((state, payload) => {
      // ASSERT
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

  // ACT
  store.getActions().math.add(10);
});

it('listening to a string, firing an action', async () => {
  // ARRANGE
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

  // ACT
  await store.dispatch({ type: 'MATH_ADD', payload: 10 });

  // ASSERT
  expect(store.getState().audit.logs).toEqual(['Added 10']);
});

it('listening to an string, firing a thunk', (done) => {
  // ARRANGE
  const audit = {
    logs: [],
    add: action((state, payload) => {
      // ASSERT
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

  // ACT
  store.dispatch({ type: 'MATH_ADD', payload: 10 });
});

it('action listening to multiple actions', async () => {
  // ARRANGE
  const model = {
    logs: [],
    actionTarget: action(() => {}),
    thunkTarget: thunk(() => {}),
    onActions: actionOn(
      (actions) => [actions.actionTarget, actions.thunkTarget],
      (state, target) => {
        expect(target.resolvedTargets).toEqual([
          '@action.actionTarget',
          '@thunk.thunkTarget(success)',
        ]);
        state.logs.push(target.payload);
      },
    ),
  };
  const store = createStore(model);

  // ACT
  store.getActions().actionTarget('action payload');
  await store.getActions().thunkTarget('thunk payload');

  // ASSERT
  expect(store.getState().logs).toEqual(['action payload', 'thunk payload']);
});

it('thunk listening to multiple actions', async () => {
  // ARRANGE
  const thunkSpy = jest.fn();
  const model = {
    logs: [],
    actionTarget: action(() => {}),
    thunkTarget: thunk(() => {}),
    onActions: thunkOn(
      (actions) => [actions.actionTarget, actions.thunkTarget],
      thunkSpy,
    ),
  };
  const store = createStore(model);

  // ACT
  store.getActions().actionTarget('action payload');

  // ASSERT
  await wait(10);
  expect(thunkSpy).toHaveBeenCalledTimes(1);
  expect(thunkSpy).toHaveBeenCalledWith(
    expect.anything(),
    {
      type: store.getActions().actionTarget.type,
      payload: 'action payload',
      resolvedTargets: ['@action.actionTarget', '@thunk.thunkTarget(success)'],
      result: undefined,
      error: undefined,
    },
    expect.anything(),
  );

  // ACT
  await store.getActions().thunkTarget('thunk payload');
  await wait(10);

  // ASSERT
  expect(thunkSpy).toHaveBeenCalledTimes(2);
  expect(thunkSpy).toHaveBeenLastCalledWith(
    expect.anything(),
    {
      type: store.getActions().thunkTarget.successType,
      payload: 'thunk payload',
      resolvedTargets: ['@action.actionTarget', '@thunk.thunkTarget(success)'],
      result: undefined,
      error: undefined,
    },
    expect.anything(),
  );
});

describe('disabling immer via configs', () => {
  it('listening to an action, firing an action with immer disabled, not returning state does not work', () => {
    // ARRANGE
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
          state.logs.push(`Added ${target.payload}`);
        },
        { immer: false },
      ),
    };
    const store = createStore({
      math,
      audit,
    });

    // ACT
    store.getActions().math.add(10);

    // ASSERT
    expect(store.getState()).toEqual({
      math: {
        sum: 10
      },
      audit: undefined
    });
  });

  it('listening to an action, firing an action with immer disabled, returning state works', () => {
    // ARRANGE
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

          return {
            ...state,
            logs: [...state.logs, `Added ${target.payload}`]
          }
        },
        { immer: false },
      ),
    };

    const store = createStore({
      math,
      audit,
    });

    // ACT
    store.getActions().math.add(10);

    // ASSERT
    expect(store.getState()).toEqual({
      math: {
        sum: 10
      },
      audit: {
        logs: ["Added 10"]
      }
    });
  });
});
