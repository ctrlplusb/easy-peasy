import './lib/enable-immer-map-set';
import React from 'react';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { createStore, action, StoreProvider, useStoreState } from '../src';

test('Map and Set within a store work as expected', () => {
  // ARRANGE
  const store = createStore({
    products: new Set(),
    addProduct: action((state, payload) => {
      state.products.add(payload);
    }),
  });

  const App = () => {
    const products = useStoreState((state) => state.products);
    const productsArray = [...products];
    return (
      <div data-testid="products">
        {productsArray.length === 0 ? 'none' : productsArray.join(',')}
      </div>
    );
  };

  const { getByTestId } = render(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>,
  );

  // ASSERT
  expect(getByTestId('products').textContent).toBe('none');

  // ACT
  act(() => {
    store.getActions().addProduct('potato');
    store.getActions().addProduct('avocado');
  });

  // ASSERT
  expect(getByTestId('products').textContent).toBe('potato,avocado');
});
