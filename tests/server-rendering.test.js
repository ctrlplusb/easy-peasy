/**
 * @jest-environment node
 */

import React from 'react';
import { renderToString } from 'react-dom/server';
import { createStore, useStoreState, StoreProvider } from '../src';

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
