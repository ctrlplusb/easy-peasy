# Using thunks to perform side effects

We can update the state of our [application](https://codesandbox.io/s/easy-peasy-tutorial-actions-1e62s) via [actions](/docs/api/action), however, there is a network request being made to a basket service.

We can encapsulate this side effect within a [thunk](/docs/api/thunk). This allows us to centralise behaviour, encapsulating side effects which will ultimately have an effect on our [store](/docs/api/store) state.

## Defining a thunk on our model

We are going to refactor our basket model slightly, defining a [thunk](/docs/api/thunk) that will make a call to our `basketService` and ultimately call an [action](/docs/api/action) to update our state when the call to the service has completed.

```javascript
// src/model/basket-model.js

import { action, thunk } from 'easy-peasy';
//                 👆 add the import
import * as basketService from '../services/basket-service';
//              👆 import the service

const basketModel = {
  productIds: [2],
  //    add a new action which we can call when the call to the basket
  // 👇 service has completed
  addedProduct: action((state, payload) => {
    state.productIds.push(payload);
  }),
  //  👇 change our addProduct action into a thunk that calls the service
  addProduct: thunk(async (actions, payload) => {
    // call our service
    await basketService.addProductToBasket(payload);
    // then dispatch an action to update state after the service call completes
    actions.addedProduct(payload);
  }),
  // ...
```

Quite a hefty update, but a lot of behaviour has now been encapsulated within our store.

[Thunks](/docs/api/thunk) are asynchronous in nature. Therefore we can use async/await within our [thunk](/docs/api/thunk) handler to easily manage our asynchronous workflow. In addition to this [thunks](/docs/api/thunk) are unable to update state directly - to get around this limitation our [thunks](/docs/api/thunk) are provided the model's actions, allowing us to dispatch these actions to update our state appropriately. You can dispatch as many actions as you like, and can even do error handling on the service call.

## Refactoring our Product component

We will now refactor our `Product` component, removing the import and the call to the basketService.

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

Note how we also put an `await` before the dispatch to our `addProductToBasket` [thunk](/docs/api/thunk). When you dispatch a [thunk](/docs/api/thunk) you will always receive a `Promise`. This allows you to resolve the `Promise` and execute code after the [thunk](/docs/api/thunk) has completed. This allows us to maintain the logic where we set a flag indicating that the adding operation is in progress.

Now that you have made this change you will be able to run your application, testing the adding of a product to your basket.

## Review

We have successfully incorporated side effects within our store, with the ability to call actions to update state in response to the actions. In the next section we will introduce computed properties, which allow us to represent derived data whilst also introducing nice performance characteristics.

You can view the progress of our application refactor [here](https://codesandbox.io/s/easy-peasy-tutorial-actions-1e62s).