/* eslint-disable */

// index.tsx
import * as React from 'react';
import { render } from 'react-dom';
import { action, Action, createStore, Model, model } from 'easy-peasy';

type CartModel = Model<{
  products?: string[] | null;
  setProducts: Action<CartModel, string[] | null>;
}>;

type StoreModel = Model<{
  cart: CartModel;
}>;

const storeModel = model<StoreModel>({
  cart: model({
    products: null,
    setProducts: action((state, payload) => {
      state.products = payload;
    }),
  }),
});

const store = createStore(storeModel);

const App = () => {
  return <h1>test</h1>;
};

render(<App />, document.getElementById('app'));
