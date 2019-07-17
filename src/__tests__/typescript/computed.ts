import { Computed, computed } from 'easy-peasy';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface ProductsModel {
  products: Product[];
  totalPrice: Computed<ProductsModel, number>;
  totalPriceVerbose: Computed<ProductsModel, number>;
}

interface BasketModel {
  productIds: number[];
  products: Computed<BasketModel, Product[], StoreModel>;
}

interface StoreModel {
  products: ProductsModel;
  baskets: BasketModel;
}

const mode: StoreModel = {
  products: {
    products: [{ id: 1, name: 'boots', price: 20 }],
    totalPrice: computed(state =>
      state.products.reduce((total, product) => total + product.price, 0),
    ),
    totalPriceVerbose: computed([state => state.products], products => {
      return products.reduce((total, product) => total + product.price, 0);
    }),
  },
  baskets: {
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
  },
};
