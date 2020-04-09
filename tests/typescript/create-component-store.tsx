import * as React from 'react';
import { createComponentStore, Action, action } from 'easy-peasy';

interface StoreModel {
  count: number;
  inc: Action<StoreModel>;
}

interface InitialData {
  count: number;
}

const useCounter = createComponentStore<StoreModel>({
  count: 0,
  inc: action(state => {
    state.count += 1;
  }),
});

const useCounterWithInitializer = createComponentStore<StoreModel, InitialData>(
  data => ({
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
