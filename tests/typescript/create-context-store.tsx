import { Action, action, createContextStore } from 'easy-peasy';
import * as React from 'react';

interface StoreModel {
  count: number;
  inc: Action<StoreModel>;
}

interface RuntimeModel {
  count: number;
}

interface Injections {
  foo: string;
}

const Counter = createContextStore<StoreModel>({
  count: 0,
  inc: action((state) => {
    state.count += 1;
  }),
});

const CounterWithCustomRuntimeModel = createContextStore<
  StoreModel,
  any,
  RuntimeModel
>((data) => ({
  count: data ? data.count + 1 : 0,
  inc: action((state) => {
    state.count += 1;
  }),
}));

const CounterWithInjections = createContextStore<StoreModel, Injections>(
  {
    count: 0,
    inc: action((state) => {
      state.count += 1;
    }),
  },
  {
    injections: {
      foo: 'bar',
    },
  },
);

function CountDisplay() {
  const count = Counter.useStoreState((state) => state.count);
  const inc = Counter.useStoreActions((actions) => actions.inc);
  return (
    <>
      <div>{count + 1}</div>
      <button onClick={() => inc()} type="button">
        +
      </button>
    </>
  );
}

function CountDisplayUseStore() {
  const store = Counter.useStore();
  return (
    <>
      <div>{store.getState().count + 1}</div>
      <button onClick={() => store.getActions().inc()} type="button">
        +
      </button>
    </>
  );
}

function TestDispatch() {
  const dispatch = Counter.useStoreDispatch();
  dispatch({
    type: 'FOO',
    payload: 'bar',
  });
  return null;
}

<CounterWithInjections.Provider injections={{ foo: 'baz' }}>
  <CountDisplay />
</CounterWithInjections.Provider>;

<CounterWithCustomRuntimeModel.Provider runtimeModel={{ count: 1 }}>
  <CountDisplay />
</CounterWithCustomRuntimeModel.Provider>;

<CounterWithCustomRuntimeModel.Provider
  // typings:expect-error
  runtimeModel={{ count: 'foo' }}
>
  <CountDisplay />
</CounterWithCustomRuntimeModel.Provider>;

<CounterWithInjections.Provider
  injections={(previousInjections) => ({ foo: 'baz' + previousInjections.foo })}
>
  <CountDisplay />
</CounterWithInjections.Provider>;

<CounterWithInjections.Provider
  // typings:expect-error
  injections={{ foo: 1 }}
>
  <CountDisplay />
</CounterWithInjections.Provider>;

<CounterWithInjections.Provider
  // This will default to the StoreModel as we didn't specify a model
  runtimeModel={{ count: 1, inc: action(() => {}) }}
>
  <CountDisplay />
</CounterWithInjections.Provider>;
