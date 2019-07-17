# Typing computed properties accessing store state

It is possible to access the entire store state within your computed properties. This can be especially helpful if you require data from other parts of your model whilst computing the value. To illustrate this we will extend our model with a `products` and `basket` model.

## Extending our model

Ok, so let's first extend our model, so that we can produce a state where we would need to access the entire store state within our [computed](/docs/api/computed) property.

Firstly, we want some products.

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
}

interface ProductsModel {
  items: Product[];
}

const productsModel: ProductsModel = {
  items: [{ id: 1, name: 'Shoes', price: 20 }]
}
```

And now we would like a basket to represent the current products our customer wishes to purchase.

```typescript
interface BasketModel {
  productIds: number[];
}

const basketModel: BasketModel = {
  productIds: [1]
}
```

## Viewing our basket

We may now have the requirement to view our basket within our application. We could implement it like so.

```typescript
import { useStoreState } from '../hooks';

function Basket() {
  const productIds = useStoreState(state => state.basket.productIds);
  const products = useStoreState(state => state.products.items);

  return (
    <>
      <h2>Products in Basket</h2>
      <ul>
        {productIds.map(id => {
          const product = products.find(product => product.id === id);
          return <li>{product.name}</li>
        })}
      </ul>
    </>
  );
}
```

As you can see every time we wish to view the products in our basket we have to map multiple pieces of our state. This may be okay in most cases, but if we needed to do this in multiple locations of our application we would have to duplicate this logic.  To avoid this we could define a [computed](/docs/api/computed) property.

## Defining a computed property for the basket products

Using our extended models, lets define a [computed](/docs/api/computed) property on the basket model that allows us to get the products that are in our basket. This [computed](/docs/api/computed) property will require the state from the products model in order to do this.

```typescript
import { Computed, ResolvedState2 } from 'easy-peasy';
import { Product } from './products';
import { StoreModel } from './index';

interface BasketModel {
  productIds: number[];
  // 👇 our computed property
  productsInBasket: Computed<
    BasketModel, // 👈 lives on the basket model
    Product[], // 👈 will return an array of products
    StoreModel // 👈 the store model to ensure our store state resolver is typed
  >
}
```

## Implementing the computed property

We will not provide the implementation for the [computed](/docs/api/computed) property.

```typescript
const basketModel: BasketModel = {
  productIds: [1],
  productsInBasket: computed(
    // 👇 note how we are first defining an array of state resolvers
    [
      state => state.productIds,
      // this state resolver uses store state, accessing the products
      //      👇                      👇
      (_, storeState) => storeState.products.items
    ]
    // the output of our state resolvers become the input args to our 
    // compute function
    (productIds, products) => productIds.map(id =>
      products.find(product => product.id === id)
    ),
  )
}
```

## Accessing the computed property

We can now access the [computed](/docs/api/computed) property the same as any other piece of state.

```typescript
import { useStoreState } from '../hooks';

function BasketProducts() {
  const products = useStoreState(state => state.basket.productsInBasket);
  return (
    <ul>
      {products.map(product => <li>{product.name}</li>)}
    </ul>
  );
}
```

If the `basket.productIds` or `products.items` states change then our computed property will be updated and our component will re-render accordingly. 👍

## Review

You can view the progress of our demo application [here](https://codesandbox.io/s/easy-peasytypescript-tutorialtyped-computed-entire-state-tcyb0)