import React from 'react';
import { render } from '@testing-library/react';

import { createStore, StoreProvider, useStore } from '../src';

test('returns the store instance', () => {
  // ARRANGE
  const store = createStore({
    foo: 'bar',
  });

  function Consumer() {
    const actual = useStore();
    expect(actual).toBe(store);
    return null;
  }

  // ACT
  render(
    <StoreProvider store={store}>
      <Consumer />
    </StoreProvider>,
  );
});
