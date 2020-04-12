/**
 * @jest-environment node
 */

import React from 'react';
import { renderToString } from 'react-dom/server';
import { createStore, useStoreState, StoreProvider } from '../src';

test('works', () => {
  // arrange
  const store = createStore({
    count: 0,
  });
  const Count = () => {
    const count = useStoreState((state) => state.count);
    return <span>{count}</span>;
  };
  const app = (
    <StoreProvider store={store}>
      <Count />
    </StoreProvider>
  );

  // act
  const actual = renderToString(app);

  // assert
  expect(actual).toEqual('<span>0</span>');
});
