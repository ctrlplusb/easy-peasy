# Using thunks to perform side effects

We have refactored our [application](https://codesandbox.io/s/easy-peasy-tutorial-actions-1e62s) with the capability to update state by dispatching [actions](/docs/api/action). 

We did however note that there is a network request being made to a basket service. We can encapsulate this side effect within a [thunk](/docs/api/thunk). Doing so allows us to encapsulate side effects that ultimately affect our state within our [store](/docs/api/store).

## Defining a thunk on our model

We are going to refactor our basket model slightly, defining a [thunk](/docs/api/thunk) that will make a call to our `basketService` and ultimately call an [action](/docs/api/action) to update our state when the call to the service has completed.

```javascript
// src/model/basket-model.js

import { action, thunk } from 'easy-peasy';
//                 👆 add the import
import * as basketService from '../services/basket-service';
//              👆 import the mock service

const basketModel = {
  productIds: [2],
  //    add a new action which we can call when the call to the basket
  // 👇 service has completed
  addedProduct: action((state, payload) => {
    state.productIds.push(payload);
  }),
  //  👇 refactor our addProduct action into a thunk which will call the service
  addProduct: thunk(async (actions, payload) => {
    // call our service
    await basketService.addProductToBasket(payload);
    // then dispatch an action to update state
    actions.addedProduct(payload);
  }),
  // ...
```

Quite a hefty update, but a lot of behaviour has now been encapsulated within our store.

[Thunks](/docs/api/thunk) are asynchronous in nature. Therefore we can use async/await within our [thunk](/docs/api/thunk) handler to easily manage our asynchronous workflow. 

It is important to note that [thunks](/docs/api/thunk) are unable to update state directly - they are instead provided the [actions](/docs/api/action), allowing us to dispatch these [actions](/docs/api/action) to update our state appropriately. You can dispatch as many [actions](/docs/api/action) as you like, and can even dispatch [actions](/docs/api/action) to represent an error that may have occurred when attempting to call the service.

## Refactoring our Product component

We will now refactor our `Product` component, removing the references to the basketService.

```diff
import React, { useCallback, useState } from 'react';
import { useStoreActions, useStoreState } from 'easy-peasy';
- import * as basketService from '../services/basket-service';

export default function Product({ id }) {
  const addProductToBasket = useStoreActions(
    actions => actions.basket.addProduct,
  );

  // ...

  const onAddToBasketClick = useCallback(async () => {
    setAdding(true);
-    await basketService.addProductToBasket(product.id);
-    addProductToBasket(product.id);
+    await addProductToBasket(product.id);
    setAdding(false);
  }, [product]);

  // ...
```

As we refactored our `addProduct` [action](/docs/api/action) into a [thunk](/docs/api/thunk) we don't need to import our [thunk](/docs/api/thunk) and dispatch it.

Note that we have prefixed the dispatch of our [thunk](/docs/api/thunk) with the `await` keyword. [Thunk](/docs/api/thunk) always return a `Promise` when they are dispatched. When the `Promise` resolves you can be sure that the [thunk](/docs/api/thunk) has completed its execution. This is handy in our current case as it allows us to maintain the logic where we set a flag indicating that the adding operation is in progress.

Once  you have made this change you will be able to run your application and then test the [thunk](/docs/api/thunk) by adding a product to your basket.

## Review

We have successfully incorporated side effects within our [store](/docs/api/store) via a [thunk](/docs/api/thunk). In the next section we will introduce the [computed](/docs/api/computed) API, which allows us to represent derived data whilst also introducing nice performance characteristics.

You can view the progress of our application refactor [here](https://codesandbox.io/s/easy-peasy-tutorial-actions-1e62s).