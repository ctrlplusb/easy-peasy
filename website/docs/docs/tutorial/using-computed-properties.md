# Using computed properties

In the previous section of our [application](https://codesandbox.io/s/easy-peasy-tutorial-actions-1e62s) we added the capability to execute side effects via [thunks](/docs/api/thunk).

In this section we are going to look at how we can take advantage of the [computed](/docs/api/computed) API in order to support derived data. This will help us clean up the more complicated state mapping that is occurring within some of our [useStoreState](/docs/api/use-store-state) instances.

## Introducing the computed API

The [computed](/docs/api/computed) API allows you to define a piece of state that is derived from other state within our [store](/docs/api/store).

```javascript
import { computed } from 'easy-peasy'; // 👈 import the helper

const sessionModel = {
  user: { username: 'jane' },
  //            👇 define a computed property
  isLoggedIn: computed(state => state.user != null)
}
```

You can access [computed](/docs/api/computed) state just like any other state via the [useStoreState](/docs/api/use-store-state) hook.

Apart from helping you to avoid repeating logic that derives state within your application, they also have really nice performance characteristics. For instance, they are only computed on-demand (i.e. only if they are currently being accessed by a mounted component).

In addition to this [computed](/docs/api/computed) properties will only be recalculated if their input state changes. This means that you can resolve any data type from a [computed](/docs/api/computed) property (e.g. a new array/object instance) and they won't fall into the same [performance pitfalls](/docs/tutorial/consuming-state#a-note-on-optimisation) that can be experienced when deriving state within a [useStoreState](/docs/api/use-store-state) hook.

## Refactoring the application to use computed properties

[Computed](/docs/api/computed) properties are the perfect candidate to help us clean up the more advanced state mapping that is happening within some of our [application's](https://codesandbox.io/s/easy-peasy-tutorial-actions-1e62s) components. Let's refactor each derived data case.

**Basket count**

First up, let's add a [computed](/docs/api/computed) property to represent the total count of products within our basket.

```javascript
// src/model/basket-model.js

import { action, computed, thunk } from 'easy-peasy';
//                 👆 import the helper
// ...

const basketModel = {
  //        👇 define the computed property
  count: computed(state => state.productIds.length),
  // ...
```

We can then update the `BasketCount` component to instead use this computed property.

```diff
export default function BasketCount() {
-  const basketCount = useStoreState(state => state.basket.productIds.length);
+  const basketCount = useStoreState(state => state.basket.count);
  return (
```

**Products in basket**

Next up, we will add a [computed](/docs/api/computed) property to represent the products that are currently in our basket. This is a more advanced implementation as we will use data from both our our basket model and our product model.

[Computed](/docs/api/computed) properties optionally allow you to provide an array of state resolver functions as the first argument to the [computed](/docs/api/computed) property definition. These state resolver functions will receive the state that is local to the [computed](/docs/api/computed) property, as well as the entire store state, and allow you to resolve specific slices of state that your [computed](/docs/api/computed) function will take as an input.

Apart from granting you access to the entire store state, using resolver functions enables performance optimisations as they reduce the likelihood of your [computed](/docs/api/computed) property needing to be recalculated (i.e. they are only recalculated when their input state changes).

Let's go ahead and define a [computed](/docs/api/computed) property, utilising state resolvers, which will allow us to represent the products currently in our basket.

```javascript
// src/model/basket-model.js

// ...
const basketModel = {
  productIds: [2],
  products: computed(
    // 👇 These are our state resolvers, ...
    [
      state => state.productIds,
      (state, storeState) => storeState.products.items
    ],
    // the results of our state resolvers become the input args
    //   👇         👇
    (productIds, products) => productIds.map(productId =>
      products.find(product => product.id === productId)
    ),
  ),
  // ...
```

We can now update our `Basket` component to use our [computed](/docs/api/computed) property.

```diff
// src/components/basket.js

import { useStoreActions, useStoreState } from "easy-peasy";

export default function Basket() {
  const removeProductFromBasket = useStoreActions(
    actions => actions.basket.removeProduct,
  );
-  const basketProducts = useStoreState(state =>
-    state.basket.productIds.map(productId =>
-      state.products.items.find(product => product.id === productId),
-    ),
-  );
+  const basketProducts = useStoreState(state => state.basket.products);

  return (
```

This is far cleaner, and should we need to access the products that are in our basket anywhere else in our application we have a much simpler mechanism by which do so, without the need to do any complicated state mapping.

**Getting a product by id**

The `mapState` function of our `Product`'s [useStoreState](/docs/api/use-store-state) hook utilises an incoming `id` property to derive the product to render.

We can create a [computed](/docs/api/computed) property that supports runtime arguments (such as component props) by returning a function within the [computed](/docs/api/computed) property definition.

Let's add a `getById` [computed](/docs/api/computed) property to our product model.

```javascript
// src/model/products-model.js

import { computed } from "easy-peasy";

const productsModel = {
  items: [
    { id: 1, name: "Broccoli", price: 2.5 },
    { id: 2, name: "Carrots", price: 4 }
  ],
  getById: computed(state =>
    // 👇 return a function that accepts an "id" argument
    id => state.items.find(product => product.id === id)
  ),
  // ...
```

We can then refactor the `Product` component to use this [computed](/docs/api/computed) property.

```diff
// src/components/product.js

import React, { useCallback, useState } from 'react';
import { useStoreActions, useStoreState } from 'easy-peasy';

export default function Product({ id }) {
  const addProductToBasket = useStoreActions(
    actions => actions.basket.addProduct,
  );
-  const product = useStoreState(state =>
-    state.products.items.find(product => product.id === id),
-  );
+  const product = useStoreState(state => state.products.getById(id));

  // state to track when we are saving to basket
  const [adding, setAdding] = useState(false);

  // ...
```

Note how we are executing the `getById` [computed](/docs/api/computed) property function, providing the `id` prop to it.

```javascript
useStoreState(state => state.products.getById(id));
```

## Review

We have now covered [computed](/docs/api/computed), a very powerful mechanism that allows us to easily derive data and unlock some really awesome performance characteristics.

In the next section we will review the final piece of our API - action listeners.

You can view the progress of our application refactor [here](https://codesandbox.io/s/easy-peasy-tutorial-computed-uohgr).

## Bonus Points

You can add internal memoisation to the function that you return within your computed property by leveraging the [memo](/docs/api/memo) API.

```javascript
// src/model/products-model.js

import { computed, memo } from "easy-peasy";
//                  👆

const productsModel = {
  items: [
    { id: 1, name: "Broccoli", price: 2.5 },
    { id: 2, name: "Carrots", price: 4 }
  ],
  getById: computed(state =>
    memo(id => state.items.find(product => product.id === id), 100)
    //                                              cache size 👆 
  ),
  // ...
```

I wouldn't suggest doing this unless you anticipated the function to be called multiple times with varying arguments _and_ the function is also doing complex/expensive deriving.