/* eslint-disable */

import * as React from 'react';
import { createContextStore, Action, action } from 'easy-peasy';

interface StoreModel {
  count: number;
  inc: Action<StoreModel>;
}

interface InitialData {
  count: number;
}

const Counter = createContextStore<StoreModel>({
  count: 0,
  inc: action(state => {
    state.count += 1;
  }),
});

const CounterWithInitializer = createContextStore<StoreModel, InitialData>(
  data => ({
    count: data ? data.count + 1 : 0,
    inc: action(state => {
      state.count += 1;
    }),
  }),
);

function CountDisplay() {
  const count = Counter.useStoreState(state => state.count);
  const inc = Counter.useStoreActions(actions => actions.inc);
  return (
    <>
      <div>{count + 1}</div>
      <button onClick={inc} type="button">
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
      <button onClick={store.dispatch.inc} type="button">
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

<CounterWithInitializer.Provider initialData={{ count: 1 }}>
  <CountDisplay />
</CounterWithInitializer.Provider>;

// typings:expect-error
<CounterWithInitializer.Provider initialData={{ count: 'foo' }}>
  <CountDisplay />
</CounterWithInitializer.Provider>;
