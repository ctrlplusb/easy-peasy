/* eslint-disable */

import * as React from 'react';
import { createContainerStore, Action, action } from 'easy-peasy';

interface StoreModel {
  count: number;
  inc: Action<StoreModel>;
}

const Counter = createContainerStore<StoreModel>({
  count: 0,
  inc: action(state => {
    state.count += 1;
  }),
});

function CountDisplay() {
  const count = Counter.useState(state => state.count);
  const inc = Counter.useActions(actions => actions.inc);
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
  const [state, actions] = Counter.useStore();
  return (
    <>
      <div>{state.count + 1}</div>
      <button onClick={actions.inc} type="button">
        +
      </button>
    </>
  );
}

function TestDispatch() {
  const dispatch = Counter.useDispatch();
  dispatch({
    type: 'FOO',
    payload: 'bar',
  });
  return null;
}

const app = (
  <Counter.Provider initialData={{ count: 1 }}>
    <CountDisplay />
    <CountDisplayUseStore />
    <TestDispatch />
  </Counter.Provider>
);
