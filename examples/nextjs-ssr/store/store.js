import { useMemo } from 'react';
import { createStore, action, persist } from 'easy-peasy';

let store;

const initialState = {
  counter: { count: 0 },
  shop: { basket: {} },
  inventory: { items: [] },
};

const counterModel = {
  ...initialState.counter,
  increment: action((state) => {
    state.count += 1;
  }),
};

const shopModel = {
  ...initialState.shop,
  addItem: action((state, id) => {
    if (state.basket[id]) {
      state.basket[id] += 1;
    } else {
      state.basket[id] = 1;
    }
  }),
};

const inventoryModel = {
  ...initialState.inventory,
  setItems: action((state, items) => {
    state.items = items;
  }),
};

const storeModel = {
  counter: counterModel,
  shop: shopModel,
  inventory: inventoryModel,
};

function initStore(preloadedState = initialState) {
  return createStore(persist(storeModel, { allow: ['shop'] }), {
    initialState: preloadedState,
  });
}

export const initializeStore = (preloadedState) => {
  let _store = store ?? initStore(preloadedState);

  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    _store = initStore({
      ...store.getState(),
      ...preloadedState,
    });
    // Reset the current store
    store = undefined;
  }

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store;
  // Create the store once in the client
  if (!store) store = _store;

  return _store;
};

export function useStore(initialState) {
  const store = useMemo(() => initializeStore(initialState), [initialState]);
  return store;
}
