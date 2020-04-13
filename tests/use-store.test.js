import React from 'react';
import { render } from '@testing-library/react';

import { createStore, StoreProvider, useStore } from '../src';

test('returns the store instance', () => {
  // arrange
  const store = createStore({
    foo: 'bar',
  });

  const Consumer = () => {
    const actual = useStore();
    expect(actual).toBe(store);
    return null;
  };

  // act
  render(
    <StoreProvider store={store}>
      <Consumer />
    </StoreProvider>,
  );
});
