import * as React from 'react';
import { action, Action, createStore } from 'easy-peasy';
import { createRoot } from 'react-dom/client';

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

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
