/* eslint-disable */

// index.tsx
import * as React from 'react';
import { render } from 'react-dom';
import { action, Action, createStore } from 'easy-peasy';

interface CartModel {
  products?: string[] | null;
  setProducts: Action<CartModel, string[] | null>;
}

interface Model {
  cart: CartModel;
}

const model: Model = {
  cart: {
    products: null,
    setProducts: action((state, payload) => {
      state.products = payload;
    }),
  },
};

const store = createStore<Model>(model);

const App = () => {
  return <h1>test</h1>;
};

render(<App />, document.getElementById('app'));
