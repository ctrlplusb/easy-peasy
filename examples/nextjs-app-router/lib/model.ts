import {
  Action,
  Computed,
  action,
  computed,
} from 'easy-peasy/server';

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
};

export interface ProductsModel {
  items: Product[];
  query: string;
  setQuery: Action<ProductsModel, string>;
  addItem: Action<ProductsModel, Product>;
  totalValue: Computed<ProductsModel, number>;
  filtered: Computed<ProductsModel, Product[]>;
}

export const productsModel: ProductsModel = {
  items: [],
  query: '',
  setQuery: action((state, payload) => {
    state.query = payload;
  }),
  addItem: action((state, payload) => {
    state.items.push(payload);
  }),
  totalValue: computed((state) =>
    state.items.reduce((sum, item) => sum + item.price, 0),
  ),
  filtered: computed((state) => {
    const q = state.query.toLowerCase();
    if (!q) return state.items;
    return state.items.filter((item) =>
      item.name.toLowerCase().includes(q),
    );
  }),
};
