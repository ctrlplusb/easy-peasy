/* eslint-disable */

import * as React from 'react';
import { createComponentStore, Action, action, Model, model } from 'easy-peasy';

type StoreModel = Model<{
  count: number;
  inc: Action<StoreModel>;
}>;

interface InitialData {
  count: number;
}

const useCounter = createComponentStore(
  model<StoreModel>({
    count: 0,
    inc: action(state => {
      state.count += 1;
    }),
  }),
);

const useCounterWithInitializer = createComponentStore<StoreModel, InitialData>(
  data =>
    model({
      count: data ? data.count + 1 : 0,
      inc: action(state => {
        state.count += 1;
      }),
    }),
);

function CountDisplay() {
  const [state, actions] = useCounter();
  return (
    <>
      <div>{state.count + 1}</div>
      <button onClick={() => actions.inc()} type="button">
        +
      </button>
    </>
  );
}

useCounterWithInitializer({ count: 1 });

// typings:expect-error
useCounterWithInitializer({ count: 'foo' });
