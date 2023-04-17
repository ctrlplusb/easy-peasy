/**
 * @jest-environment node
 */

import React from 'react';
import { renderToString } from 'react-dom/server';
import { createStore, useStoreState, StoreProvider, action } from '../src';

test('works', () => {
  // ARRANGE
  const store = createStore({
    count: 0,
  });

  function Count() {
    const count = useStoreState((state) => state.count);
    return <span>{count}</span>;
  }
  const app = (
    <StoreProvider store={store}>
      <Count />
    </StoreProvider>
  );

  // ACT
  const actual = renderToString(app);

  // ASSERT
  expect(actual).toEqual('<span>0</span>');
});

test('works with inital state', () => {
  // ARRANGE
  const store = createStore(
    {
      count: null,
      bump: action((state) => {
        state.count += state.increment;
      }),
    },
    {
      count: 0,
      initialState: {
        increment: 5,
      },
    },
  );

  store.getActions().bump();

  function Count() {
    const count = useStoreState((state) => state.count);
    return <span>{count}</span>;
  }
  const app = (
    <StoreProvider store={store}>
      <Count />
    </StoreProvider>
  );

  // ACT
  const actual = renderToString(app);

  // ASSERT
  expect(actual).toEqual('<span>5</span>');
});
