---
sidebar: auto
---

# Quick Start

> i.e. The TLDR tutorial 🚀

This quick fire overview will provide you with a brief introduction to 90% of Easy Peasy's API.

## Installation

```bash
npm install easy-peasy
```

## Use a model to define your store

Your [store](/docs/api/store) definition is represented via an object-based model.

```javascript
const productsModel = {
  items: {
    1: { id: 1, name: 'Peas', price: 10 }
  }
};

const basketModel = {
  productIds: [1]
};

const storeModel = {
  products: productsModel,
  basket: basketModel
};
```

Feel free to split your model into separate files, importing them and composing them as you please.

## Create the store

Provide your model to [createStore](/docs/api/create-store) in order to get a [store](/docs/api/store) instance.

```javascript
import { createStore } from 'easy-peasy';

const store = createStore(storeModel);
```

> FYI, the output store is a Redux store, fully compatible with any library that expects to receive one (e.g. react-redux)

## Wrap your application

Use the [StoreProvider](/docs/api/store-provider) component to connect the [store](/docs/api/store) to your application.

```javascript
import { StoreProvider } from 'easy-peasy';

ReactDOM.render(
  <StoreProvider store={store}>
    <App />
  </StoreProvider>,
  rootEl
);
```

## Consume state

The [useStoreState](/docs/api/use-store-state) hook allows you to consume state.

```javascript
import { useStoreState } from 'easy-peasy';

function ProductsInBasket() {
  const count = useStoreState(state => state.basket.productIds.length);
  return <div>{count} items in basket</div>;
}
```

## Adding actions to your model

Define an [action](/docs/api/action) against your model to support updates.

```javascript
import { action } from 'easy-peasy';
//         👆

const basketModel = {
  productIds: [1],
  //            👇
  addProduct: action((state, payload) => {
    state.productIds.push(payload);
  })
};
```

The [action](/docs/api/action) will receive the state which is local to it.

By default you need to mutate the state with the action, which we convert to an immutable update via [immer](https://github.com/immerjs/immer). If you prefer to return new immutable instances of your state, like a standard Redux reducer, you can set the `disableImmer` [configuration](/docs/api/store-config) of the [createStore](/docs/api/create-store).

## Dispatching your actions

The [useStoreActions](/docs/api/use-store-actions) hook allows you to access an [action](/docs/api/action) within a component.

```javascript
import { useStoreActions } from 'easy-peasy';
//          👆

function Product({ product }) {
  //                                👇
  const addProductToBasket = useStoreActions(actions => actions.basket.addProduct);
  return (
    <div>
      <h2>{product.name}</h2>
      {/*                            👇                   */}
      <button onClick={() => addProductToBasket(product.id)}>
        Add to basket
      </button>
    </div>
  )
}
```

## Add thunks to perform side effects

Define a [thunk](/docs/api/thunk) in order to perform a side effect, such as making a request to an API.

```javascript
import { thunk } from 'easy-peasy';
//        👆

const productsModel = {
  items: {
    1: { id: 1, name: 'Peas', price: 10 }
  },
  //               👇
  updateProduct: thunk(async (actions, payload) => {
    const updated = await productService.update(payload.id, payload);
    actions.setProduct(updated); // 👈 dispatch local actions to update state
  }),
  setProduct: action((state, payload) => {
    state.items[payload.id] = payload;
  }),
}
```

## Dispatch your thunks

The [useStoreActions](/docs/api/use-store-actions) hook allows you to access a [thunk](/docs/api/action) within a component.

```javascript
import { useStoreActions } from 'easy-peasy';
//           👆

function EditProduct({ product }) {
  //                        👇
  const updateProduct = useStoreActions(actions => actions.products.updateProduct);
  return (
    <ProductForm
      product={product}
      //                            👇
      onSave={updatedValues => updateProduct(updatedValues)}
    />
  );
}
```

## Computed properties

You can create derived state via [computed](/docs/api/computed).

```javascript
import { computed } from 'easy-peasy';
//         👆

const productsModel = {
  items: {
    1: { id: 1, name: 'Peas', price: 10 }
  },
  //        👇
  count: computed(state => Object.values(state.items).length)
}
```

## Consuming computed properties

[Computed](/docs/api/computed) properties are accessed via the [useStoreState](/docs/api/use-store-state) hook, just like any other state.

```javascript
import { useStoreState } from 'easy-peasy';
//            👆

function ProductCount() {
  //               👇
  const count = useState(state => state.products.count);
  return <div>{count} products</div>;
}
```

## Action/Thunk Listeners

You can create listener actions or thunks via the [actionOn](/docs/api/action-on) and [thunkOn](/docs/api/thunk-on) APIs respectively. These APIs allow you to create an action or thunk that will execute in response to target actions being fired.

```javascript
import { actionOn } from 'easy-peasy';
//          👆

const auditModel = {
  logs: [],
  onAddedToBasket: actionOn(
    // targetResolver function receives actions and resolves the targets:
    (actions, storeActions) => storeActions.basket.addProduct
    // action handler that executes when target is executed:
    (state, target) => {
      state.logs(`Added product ${target.payload} to basket`);
    },
  )
}
```

A listener will receive the same payload as was provided to the target being listened to.

## Closing notes

That concludes the quick start overview of Easy Peasy. Whilst this should have provided enough of an overview to immediately begin developing with Easy Peasy we highly recommend that you review the [documentation](/docs/introduction) for a more detailed overview of the APIs.

Within the [documentation](/docs/introduction) section you will find detailed tutorials, API docs, TypeScript tutorials, recipes, etc.
