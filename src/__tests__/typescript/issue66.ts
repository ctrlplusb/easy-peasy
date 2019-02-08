import { Actions, State, Action, createStore } from "easy-peasy";

interface CartModel {
  products: string[] | null;
  setProducts: Action<CartModel, string[] | null>;
}

interface Model {
  cart: CartModel;
}

const model: Model = {
  cart: {
    products: null,
    setProducts: (state, payload) => {
      state.products = payload;
    }
  }
};

const store = createStore<Model>(model);

const actions = {} as Actions<Model>;
const state = {} as State<Model>;

actions.cart.setProducts(null);
state.cart.products;
