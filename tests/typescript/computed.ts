import { Computed, computed, createStore, createTypedHooks } from 'easy-peasy';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface ProductsModel {
  products: Product[];
  totalPrice: Computed<ProductsModel, number>;
  totalPriceVerbose: Computed<ProductsModel, number>;
  priceForProduct: Computed<ProductsModel, (id: number) => number>;
  // https://github.com/ctrlplusb/easy-peasy/issues/567
  packages: Computed<
    ProductsModel,
    | { core: Product[]; waves: Product[][]; hasWavesContent: boolean }
    | undefined,
    StoreModel
  >;
  firstProduct: Computed<ProductsModel, Product | undefined>;
}

interface BasketModel {
  productIds: number[];
  products: Computed<BasketModel, Product[], StoreModel>;
}

interface StoreModel {
  products: ProductsModel;
  baskets: BasketModel;
  one: string;
  two: boolean;
  three: number;
  four: Set<boolean>;
  five: Date;
  six: Map<string, number>;
  bigComputed: Computed<StoreModel, boolean>;
  dependentComputed: Computed<StoreModel, boolean>;
}

const model: StoreModel = {
  products: {
    firstProduct: computed((state) =>
      state.products.length > 0 ? state.products[0] : undefined,
    ),
    products: [{ id: 1, name: 'boots', price: 20 }],
    totalPrice: computed((state) =>
      state.products.reduce((total, product) => total + product.price, 0),
    ),
    totalPriceVerbose: computed([(state) => state.products], (products) => {
      return products.reduce((total, product) => total + product.price, 0);
    }),
    priceForProduct: computed((state) => (id) => state.products[id].price),
    packages: computed((state) => ({
      core: state.products,
      hasWavesContent: true,
      waves: [],
    })),
  },
  baskets: {
    productIds: [1],
    products: computed(
      [
        (state) => state.productIds,
        (state, storeState) => storeState.products.products,
      ],
      (productIds, products) =>
        productIds.reduce<Product[]>((acc, id) => {
          const product = products.find((p) => p.id === id);
          if (product) {
            acc.push(product);
          }
          return acc;
        }, []),
    ),
  },
  one: 'one',
  two: true,
  three: 3,
  four: new Set(),
  five: new Date(),
  six: new Map(),
  bigComputed: computed(
    [
      (state) => state.one,
      (state) => state.two,
      (state) => state.three,
      (state) => state.four,
      (state) => state.five,
      (state) => state.six,
    ],
    (one, two, three, four, five, six) => {
      `${one}foo`;
      two === true;
      three + 3;
      four.has(true);
      five.getMilliseconds();
      six.set('foo', 6);
      return true;
    },
  ),
  dependentComputed: computed(
    [(state) => state.bigComputed],
    (bigComputed) => bigComputed,
  ),
};

const store = createStore(model);

if (store.getState().products.firstProduct) {
  store.getState().products.firstProduct?.name + 'foo';
}
store.getState().products.priceForProduct(1) + 1;
store.getState().products.totalPrice + 1;
store.getState().products.packages?.core[0];

// https://github.com/ctrlplusb/easy-peasy/issues/570
const typedHooks = createTypedHooks<StoreModel>();

const useProducts = () => typedHooks.useStoreState((state) => state.products);

const { firstProduct } = useProducts();

firstProduct?.name;
