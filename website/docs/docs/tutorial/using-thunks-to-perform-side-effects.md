# Using thunks to perform side effects

We have refactored our [application](https://codesandbox.io/s/easy-peasy-tutorial-actions-1e62s) with the capability to update state by dispatching [actions](/docs/api/action.html). 

We did however note that there is a network request being made to the basket service within the `Product` component. After the request to the basket service has completed an [action](/docs/api/action.html) is dispatched to add the respective product to the basket state. This type of side effect, which has a direct correlation to our state is perfect for encapsulation within a [thunk](/docs/api/thunk.html).

[Thunks](/docs/api/thunk.html) cannot modify state directly, however, they can dispatch [actions](/docs/api/action.html) to do so. Therefore we can manage the network effect within our thunk, and when it has completed call an [action](/docs/api/action.html) to update our state appropriately. [Thunks](/docs/api/thunk.html) also have first class support for asynchronous code - i.e. `async/await` or `Promise`.

## Defining a thunk on our model

We are going to refactor our basket model slightly, defining a [thunk](/docs/api/thunk.html) that will make a call to our `basketService` and ultimately call an [action](/docs/api/action.html) to update our state when the call to the service has completed.

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

> [Thunks](/docs/api/thunk.html) can be asynchronous or synchronous. If you use `async/await` or return a `Promise` from your [thunk](/docs/api/thunk.html) it will be considered asynchronous. Easy Peasy has special logic to monitor asynchronous [thunks](/docs/api/thunk.html) and will ensure listeners (we will cover them later) are only dispatched when an asynchronous [thunk](/docs/api/thunk.html) has resolved. A use-case for a synchronous thunk would be to encapsulate if/else logic around the dispatching of actions. That being said, using thunks in an asynchronous manner to encapsulate side effects is by far the more common use-case.

It is important to remember that [thunks](/docs/api/thunk.html) are unable to update state directly - they are instead provided the local [actions](/docs/api/action.html) and [thunks](/docs/api/thunk.html) via the `actions` argument. We can dispatch the provided actions to update our state appropriately.

> You can dispatch as many [actions](/docs/api/action.html) as you like. Consider the case of dispatching different actions to represent a failed or successful network request.

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

As we refactored our `addProduct` [action](/docs/api/action.html) into a [thunk](/docs/api/thunk.html) we don't change our `useStoreActions` code, instead we are prefixing our `addProduct` dispatch with an an `await`, leveraging the `Promise` that will be returned by our asynchronous thunk. This allows us to maintain the existing behaviour around setting the `adding` flag which indicates to the UI when the adding operation is in progress.

Once  you have made this change you will be able to run your application and then test the [thunk](/sdocs/api/thunk.html) by adding a product to your basket.

## Review

We have successfully incorporated side effects within our [store](/docs/api/store.html) via a [thunk](/docs/api/thunk.html). In the next section we will introduce the [computed](/docs/api/computed.html) API, which allows us to represent derived data whilst also introducing nice performance characteristics.

You can view the progress of our application refactor [here](https://codesandbox.io/s/easy-peasy-tutorial-actions-1e62s).