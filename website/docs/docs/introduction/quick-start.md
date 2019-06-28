# Quick Start

The tutorial for the impatient. ⏰🚀

This will give you a quick fire overview of Easy Peasy. When you have the time, or if you are interested in a bit more detail, we would recommend reading the [full tutorial](/docs/tutorial) and [API docs](/docs/api).

## Installation

```bash
npm install easy-peasy
```

## Define your model

Your state is represented via an object-based model. Feel free to split your model into separate files.

```javascript
const productsModel = : {
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

## Create your store

Provide your model to [createStore](/docs/api/create-store) in order to get a [store](/docs/api/store) instance.

```javascript
import { createStore } from 'easy-peasy';

const store = createStore(storeModel);
```

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

## Consume state in a component

The [useStoreState](/docs/api/use-store-state) hook allows you to consume state.

```javascript
import { useStoreState } from 'easy-peasy';

function ProductsInBasket() {
  const count = useStoreState(state => state.basket.productIds.length);
  return <div>{count} items in basket</div>;
}
```

## Extend model with actions to update state

Define an [action](/docs/api/action) against your model to support updates.

```javascript
import { action } from 'easy-peasy';

const basketModel = {
  productIds: [1],
  addProduct: action((state, product) => {
    state.productIds.push(product.id);
  })
};
```

The [action](/docs/api/action) will receive the local modal state against which it is bound. You can mutate the state with the update, which we convert to an immutable update via [immer](https://github.com/immerjs/immer), or you can return new immutable version of your state like a standard reducer pattern.

## Dispatch your actions from components

The [useStoreActions](/docs/api/use-store-actions) hook allows you to use an [action](/docs/api/action) within a component.

```javascript
import { useStoreActions } from 'easy-peasy';

function Product({ product }) {
  const addProductToBasket = useStoreActions(actions => actions.basket.addProduct);
  return (
    <div>
      <h2>{product.name}</h2>
      <button onClick={() => addProductToBasket(product.id)}>
        Add to basket
      </button>
    </div>
  )
}
```

## Extend model with thunks to perform side effects

Define a [thunk](/docs/api/thunk) in order to perform a side effect, such as make an API request.

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

## Dispatch your thunks from a component

The [useStoreActions](/docs/api/use-store-actions) hook allows you to use an [thunk](/docs/api/action) within a component.

```javascript
import { useStoreActions } from 'easy-peasy';

function EditProduct({ product }) {
  //        👇 mapped thunk
  const updateProduct = useStoreActions(actions => actions.products.updateProduct);
  return (
    <ProductForm 
      product={product} 
      //                            👇 dispatching thunk
      onSave={updatedValues => updateProduct(updatedValues)}
    />  
  );
}
```

## Derived data

You can derive state via [computed](/docs/api/computed) properties.

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

## Consuming computed properties within component

[Computed](/docs/api/computed) properties are accessed via the [useStoreState](/docs/api/use-store-state) hook, just like any other state.

```javascript
import { useStoreState } from 'easy-peasy';

function ProductCount() {
  const count = useState(state => state.products.count);
  return <div>{count} products</div>;
}
```

## Listening to actions from other models

[Actions](/docs/api/action) or [thunks](/docs/api/thunk) can be configured to listen to any other [action](/docs/api/action)/[thunk](/docs/api/thunk), firing in response to them completing.

```javascript
import { action } from 'easy-peasy';

const auditModel = {
  logs: [],
  onAddedToBasket: action(
    (state, payload) => {
      state.logs(`Added product ${payload} to basket`);
    },
    // 👇 config:
    { listenTo: actions => actions.basket.addProduct }
  )
}
```

## All done

That concludes the quick start overview of Easy Peasy. The above APIs would likely represent the 95% use case of Easy Peasy, but do look at the [full tutorial](/docs/tutorial) and the [API docs](/docs/api) to gain a deeper insight into Easy Peasy and the tools it provides to you.
