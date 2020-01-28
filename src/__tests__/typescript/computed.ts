import { Computed, computed, Model, model, createStore } from 'easy-peasy';

interface Product {
  id: number;
  name: string;
  price: number;
}

type ProductsModel = Model<{
  products: Product[];
  totalPrice: Computed<ProductsModel, number>;
  totalPriceVerbose: Computed<ProductsModel, number>;
}>;

type BasketModel = Model<{
  productIds: number[];
  products: Computed<BasketModel, Product[], StoreModel>;
}>;

type StoreModel = Model<{
  products: ProductsModel;
  baskets: BasketModel;
}>;

const storeModel = model<StoreModel>({
  products: model({
    products: [{ id: 1, name: 'boots', price: 20 }],
    totalPrice: computed(state =>
      state.products.reduce((total, product) => total + product.price, 0),
    ),
    totalPriceVerbose: computed([state => state.products], products => {
      return products.reduce((total, product) => total + product.price, 0);
    }),
  }),
  baskets: model({
    productIds: [1],
    products: computed(
      [
        state => state.productIds,
        (state, storeState) => storeState.products.products,
      ],
      (productIds, products) =>
        productIds.reduce<Product[]>((acc, id) => {
          const product = products.find(p => p.id === id);
          if (product) {
            acc.push(product);
          }
          return acc;
        }, []),
    ),
  }),
});

const store = createStore(storeModel);

store.getState().baskets.products[0].name;
store.getState().products.totalPrice + 100;
