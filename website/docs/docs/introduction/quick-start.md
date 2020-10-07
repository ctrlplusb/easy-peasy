# Quick Start

- [Create the store](#create-the-store)
- [Expose the store](#expose-the-store)
- [Using state](#using-state)
- [Defining actions to perform state updates](#defining-actions-to-perform-state-updates)
- [Dispatching actions](#dispatching-actions)
- [Encapsulating side effects via thunks](#encapsulating-side-effects-via-thunks)
- [Dispatching thunks](#dispatching-thunks)
- [Deriving state via computed properties](#deriving-state-via-computed-properties)
- [Using computed properties](#using-computed-properties)
- [Creating reactive actions](#creating-reactive-actions)
- [Persisting state](#persisting-state)

## Create the store

Define your store by providing an object based model to the [createStore](/docs/api/create-store.html) function in order to create a [store](/docs/api/store.html) instance.

```javascript
import { createStore } from 'easy-peasy';

const store = createStore({
  basket: [],
  products: {
    1: { id: 1, name: 'Beetroot', price: 10.55 },
  },
});
```

> Note: Your model can be as complex/nested as you like. Feel free to compose it from imports.

## Expose the store

Surround your application with the [StoreProvider](/docs/api/store-provider.html) component, providing it your [store](/docs/api/store.html) instance.

```javascript
import { StoreProvider } from 'easy-peasy';
import { store } from './store';

ReactDOM.render(
  <StoreProvider store={store}>
    <App />
  </StoreProvider>,
  rootEl,
);
```

## Using state

The [useStoreState](/docs/api/use-store-state.html) hook allows you to access your store's state.

```javascript
import { useStoreState } from 'easy-peasy';
//           👆

function BasketCount() {
  //                 👇
  const count = useStoreState((state) => state.basket.length);
  return <div>{count} items in basket</div>;
}
```

## Defining actions to perform state updates

Place an [action](/docs/api/action.html) within your model to support updates.

```javascript
import {
  createStore,
  action, // 👈
} from 'easy-peasy';

const store = createStore({
  basket: [],
  products: {
    1: { id: 1, name: 'Beetroot', price: 10.55 },
  },
  // 👇 Attach the action to your store
  addProductToBasket: action((state, payload) => {
    state.basket.push(payload);
  }),
});
```

The [action](/docs/api/action.html) will receive the state which is local to it.

To update the state you can mutate it within the action - under the hood we will convert the operation into an immutable update against your store by using [immer](https://github.com/immerjs/immer).

You can alternatively return new immutable instances of your state, as you would within a standard Redux reducer.

```javascript
addProduct: action((state, payload) => {
  return {
    ...state,
    basket: [...state.basket, payload],
  };
});
```

## Dispatching actions

The [useStoreActions](/docs/api/use-store-actions.html) hook allows you to fire an [action](/docs/api/action.html) from your components.

```javascript
import { useStoreActions } from 'easy-peasy';
//          👆

function Product({ product }) {
  //                                👇
  const addProductToBasket = useStoreActions(
    (actions) => actions.addProductToBasket,
  );
  return (
    <div>
      <h2>{product.name}</h2>
      {/*                            👇                   */}
      <button onClick={() => addProductToBasket(product.id)}>
        Add to basket
      </button>
    </div>
  );
}
```

## Encapsulating side effects via thunks

Define a [thunk](/docs/api/thunk.html) in order to perform a side effect, such as making a request to an API.

```javascript
import {
  createStore,
  thunk,
  action, // 👈
} from 'easy-peasy';

const store = createStore({
  basket: [],
  products: {
    1: { id: 1, name: 'Beetroot', price: 10.55 },
  },
  addProduct: action((state, payload) => {
    state.basket.push(payload);
  }),
  saveProductToBasket: thunk(),
});
```

```javascript
import { thunk, action } from 'easy-peasy';
//        👆

const productsModel = {
  items: {
    1: { id: 1, name: 'Peas', price: 10 },
  },
  //               👇
  updateProduct: thunk(async (actions, payload) => {
    const updated = await productService.update(payload.id, payload);
    actions.setProduct(updated); // 👈 dispatch local actions to update state
  }),
  setProduct: action((state, payload) => {
    state.items[payload.id] = payload;
  }),
};
```

## Dispatching thunks

The [useStoreActions](/docs/api/use-store-actions.html) hook allows you to fire a [thunk](/docs/api/action.html) within your components.

```javascript
import { useStoreActions } from 'easy-peasy';
//           👆

function EditProduct({ product }) {
  //                        👇
  const updateProduct = useStoreActions(
    (actions) => actions.products.updateProduct,
  );
  return (
    <ProductForm
      product={product}
      //                            👇
      onSave={(updatedValues) => updateProduct(updatedValues)}
    />
  );
}
```

## Deriving state via computed properties

You can create derived state via the [computed](/docs/api/computed.html) API.

```javascript
import { computed } from 'easy-peasy';
//         👆

const productsModel = {
  items: {
    1: { id: 1, name: 'Peas', price: 10 },
  },
  //        👇
  count: computed((state) => Object.values(state.items).length),
};
```

## Using computed properties

[Computed](/docs/api/computed.html) properties are accessed via the [useStoreState](/docs/api/use-store-state.html) hook, just like any other state.

```javascript
import { useStoreState } from 'easy-peasy';
//            👆

function ProductCount() {
  //               👇
  const count = useStoreState((state) => state.products.count);
  return <div>{count} products</div>;
}
```

## Creating reactive actions

You can create "listener" actions or thunks via the [actionOn](/docs/api/action-on.html) and [thunkOn](/docs/api/thunk-on.html) APIs. These APIs create an actions that will execute as a reaction to the actions that they are listening to being executed.

```javascript
import { actionOn } from 'easy-peasy';
//          👆

const auditModel = {
  logs: [],
  onAddedToBasket: actionOn(
    // Define a targetResolver which receives the actions and must return
    // the action to listen to:
    (actions, storeActions) => storeActions.basket.addProduct,
    // Then define the action handler which will be executed in response:
    (state, target) => {
      state.logs.push(`Added product ${target.payload} to basket`);
    },
  ),
};
```

A listener receives the same payload that was provided to the target.

## Persisting state

Should you wish to persist your state, or part of it, you can utilise the [persist](/docs/api/persist.html) to do so.

Firstly, surround your model with the [persist]() helper.

```javascript
import { persist } from 'easy-peasy';
//         👆

const store = createStore(
  // 👇 wrap your model
  persist({
    count: 1,
    inc: action((state) => {
      state.count += 1;
    }),
  }),
);
```

This simple adjustment will make Easy Peasy save your store state into `sessionStorage`. Easy Peasy will persist any changes that occur to the state.

It will also attempt to rehydrate any existing state that is in `sessionStorage` when you create your store.

Update the rendering of your React application to ensure that the rehydration has completed.

```javascript
import store from './my-easy-peasy-store';

// This returns a Promise which will resolve when the rehydration process
// has completed
//                  👇
store.persist.resolveRehydration().then(() => {
  ReactDOM.render(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>,
    document.getElementById('app'),
  );
});
```
