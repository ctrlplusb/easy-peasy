---
sidebar: auto
---

# Quick Start

> i.e. The TLDR tutorial 🚀

This quick fire tutorial will introduce you to the primary APIs of Easy Peasy.

<p>&nbsp;</p>

## Installation

```bash
npm install easy-peasy
```

<p>&nbsp;</p>

## Define a model

A [model](/docs/api/model.html) encapuslates your state and the actions against thems.

```javascript
import { model } from 'easy-peasy';

const storeModel = model({
  todos: ['Learn Easy Peasy'],
});
```

You can nest models for more advanced store requirements.

```javascript
import { model } from 'easy-peasy';

const productsModel = model({
  items: {
    1: { id: 1, name: 'Peas', price: 10 }
  }
});

const basketModel = model({
  productIds: [1]
});

const storeModel = model({
  products: productsModel,
  basket: basketModel
});
```

Feel free to split your models into separate files, importing them and composing them as you please.

<p>&nbsp;</p>

## Create the store

Provide your model to [createStore](/docs/api/create-store.html) in order to create a [store](/docs/api/store.html) instance.

```javascript
import { createStore } from 'easy-peasy';
import { storeModel } from './models';

const store = createStore(storeModel);
```

<p>&nbsp;</p>

## Expose the store

Surround your application with the [StoreProvider](/docs/api/store-provider.html) component, providing it your [store](/docs/api/store.html) instance.

```javascript
import { StoreProvider } from 'easy-peasy';
import { store } from './store';

ReactDOM.render(
  <StoreProvider store={store}>
    <App />
  </StoreProvider>,
  rootEl
);
```

<p>&nbsp;</p>

## Accessing state from components

Utilise the [useStoreState](/docs/api/use-store-state.html) hook to access state.

```javascript
import { useStoreState } from 'easy-peasy';

function BasketCount() {
  const count = useStoreState(state => state.basket.productIds.length);
  return <div>{count} items in basket</div>;
}
```

<p>&nbsp;</p>

## Defining actions on your model to enable state updates

Define an [action](/docs/api/action.html) against your model to support updates.

```javascript
import { action, model } from 'easy-peasy';
//         👆

const basketModel = model({
  productIds: [1],
  //            👇
  addProduct: action((state, payload) => {
    state.productIds.push(payload);
  })
});
```

The [action](/docs/api/action.html) will receive the state which is local to it. To update the state you simply mutate it directly - under the hood we will convert the mutation into an  immutable update via [immer](https://github.com/immerjs/immer). If you prefer you can instead return new immutable instances of your state, as you would within a standard Redux reducer.

<p>&nbsp;</p>

## Dispatching your actions

The [useStoreActions](/docs/api/use-store-actions.html) hook allows you to fire an [action](/docs/api/action.html) from a component.

```javascript
import { useStoreActions } from 'easy-peasy';
//          👆

function Product({ product }) {
  //                                👇
  const addProductToBasket = useStoreActions(actions => actions.basket.addProduct);
  return (
    <div>
      <h2>{product.name}</h2>
      {/*                            👇                  */}
      <button onClick={() => addProductToBasket(product.id)}>
        Add to basket
      </button>
    </div>
  );
}
```

<p>&nbsp;</p>

## Add thunks to encapsulate side effects

Define a [thunk](/docs/api/thunk.html) in order to perform a side effect, such as making a network request.

```javascript
import { thunk, action, model } from 'easy-peasy';
//        👆

const productsModel = model({
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
});
```

<p>&nbsp;</p>

## Dispatch your thunks

The [useStoreActions](/docs/api/use-store-actions.html) hook allows you to access a [thunk](/docs/api/action.html) within a component.

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

<p>&nbsp;</p>

## Deriving state via computed properties

You can create derived state via the [computed](/docs/api/computed.html) API.

```javascript
import { computed, model } from 'easy-peasy';
//         👆

const productsModel = model({
  items: {
    1: { id: 1, name: 'Peas', price: 10 }
  },
  //        👇
  count: computed(state => Object.values(state.items).length)
});
```

<p>&nbsp;</p>

## Accessing computed properties in components

[Computed](/docs/api/computed.html) properties are accessed via the [useStoreState](/docs/api/use-store-state.html) hook, just like any other state.

```javascript
import { useStoreState } from 'easy-peasy';
//            👆

function ProductCount() {
  //               👇
  const count = useStoreState(state => state.products.count);
  return <div>{count} products</div>;
}
```

<p>&nbsp;</p>

## Advanced APIs

Here's a tiny peak at some of the more advanced APIs. Most store use cases probably don't need this level of complexity though. 😀

### Making your model reactive via action/thunk Listeners

You can create listener actions or thunks, which will fire in response to targeted actions/thunks. This is done via the [actionOn](/docs/api/action-on.html) and [thunkOn](/docs/api/thunk-on.html) APIs respectively.

```javascript
import { actionOn, model } from 'easy-peasy';
//          👆

const auditModel = model({
  logs: [],
  onAddedToBasket: actionOn(
    // Provide a targetResolver, which receives the actions and must return
    // the action(s) to listen to:
    (actions, storeActions) => storeActions.basket.addProduct,
    // Then define the action handler which will be executed in response:
    (state, target) => {
      state.logs(`Added product ${target.payload} to basket`);
    },
  )
})
```

A listener receives the same payload that was provided to the target.

<p>&nbsp;</p>

## Closing notes

Whilst this should have provided enough of an overview to immediately begin developing with Easy Peasy we highly recommend that you review the [documentation](/docs/introduction/) for a more detailed overview of the APIs.

Within the [documentation](/docs/introduction/) section you will find detailed tutorials, API docs, TypeScript tutorials, recipes, etc.
