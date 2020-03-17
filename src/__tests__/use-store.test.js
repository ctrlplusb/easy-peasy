import React from 'react';
import { render } from '@testing-library/react';

import { createStore, model, StoreProvider, useStore } from '../index';

test('returns the store instance', () => {
  // arrange
  const store = createStore(
    model({
      foo: 'bar',
    }),
  );

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
