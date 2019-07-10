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

Apart from helping you to avoid repeating state deriving logic across your application, they also have really nice performance characteristics. For instance, they are only computed on-demand (i.e. only if they are actually being used within a mounted component).

In addition to this they will only be recalculated if their input state changes. This means that you can return any data type you like within a computed property (e.g. a new array/object instance) and they won't fall into the same performance pitfalls that can be experienced when deriving state within a [useStoreState](/docs/api/use-store-state) hook.

## Refactoring the application to use computed properties

[Computed](/docs/api/computed) properties are the perfect candidate to help us clean up the more advanced state mapping that is happening within some of our [application's](https://codesandbox.io/s/easy-peasy-tutorial-actions-1e62s) components.

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

Next up, we will add a [computed](/docs/api/computed) property to represent the products that are currently in our basket. This is a more advanced implementation as we will reach from our basket model to state within our product model.

[Computed](/docs/api/computed) properties optionally allow you to define an array of state resolver functions as the second argument to the [computed](/docs/api/computed) property definition. These state resolver functions will receive the state that is local to the [computed](/docs/api/computed) property, as well as the entire store state.

This exposes two benefits:

1. You will be able to access state from across your entire store within your [computed](/docs/api/computed) property,
2. You can isolate the specific slices of state that your [computed](/docs/api/computed) property depends on, thereby reducing the likelihood of your [computed](/docs/api/computed) property being recalculated.

Let's go ahead and define our [computed](/docs/api/computed) property, utilising state resolvers.

```javascript
// src/model/basket-model.js

// ...
const basketModel = {
  //        👇 define the computed property
  products: computed(
    // The state resolver results become the argument inputs
    //   👇         👇
    (productIds, products) => productIds.map(productId =>
      products.find(product => product.id === productId)
    ),
    // 👇 These are our state resolvers...
    [
      // Resolve the product ids
      state => state.productIds,
      // And then resolve the products from the products model
      (state, storeState) => storeState.products.items
    ],
  ),
  // ...
```

We can now update our `Basket` component to instead use our [computed](/docs/api/computed) property.

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

**Getting a product by id**

The `mapState` function of our `Product`'s [useStoreState](/docs/api/use-store-state) hook utilises an incoming `id` property to derive the target product to render.

We can utilise [computed](/docs/api/computed) properties, returning a function within them, which would then allow for runtime arguments to be used within our [computed](/docs/api/computed).

Let's add a `getById` [computed](/docs/api/computed) property to our product model.

```javascript
// src/model/products-model.js

import { computed } from "easy-peasy";
//          👆 import the helper

const productsModel = {
  //           👇 define our computed property
  getById: computed(state => 
    // return a function that accepts an "id" argument
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

Note how we are executing the [computed](/docs/api/computed) property function, providing the `id` prop to it.

## Review

You can view the progress of our application refactor [here](https://codesandbox.io/s/easy-peasy-tutorial-computed-uohgr).