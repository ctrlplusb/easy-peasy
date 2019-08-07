# Using actions to update state

Our [application](https://codesandbox.io/s/easy-peasy-tutorial-component-state-28cjm) has the ability to consume state, but no way to update it.

In this section we will introduce the [action](/docs/api/action.html) API which will allow us to do exactly this.

## Defining actions on our model

We are going to define two [actions](/docs/api/action.html) on our `basketModel`; one to add a product to our basket, and another to remove a product from our basket. 

Let's go ahead and update our `basketModel` to include these two actions.

```javascript
// src/model/basket-model.js

import { action } from 'easy-peasy'; // 👈 import

const basketModel = {
  productIds: [2],
  //  👇 define an action to add a product to basket
  addProduct: action((state, payload) => {
    state.productIds.push(payload);
  }),
  //  👇 define an action to remove a product from basket
  removeProduct: action((state, payload) => {
    state.productIds.splice(payload, 1);
  }),
};

export default basketModel;
```

Looking at the above you will note that we are defining actions directly against our model. Each definition includes a handler function which will be used to perform the state updates. The handler will receive the local state (in this case the basket model state) as well as any payload that was provided to the action when it was dispatched.

Within our handlers we are mutating the state directly to perform the update (🙈). Don't worry! We use the amazing [immer](https://github.com/immerjs/immer) library under the hood, which allows us to convert mutations into immutable updates against our store. It may seem magic, but it is so much more convenient and less error prone.

For example, look at the "immutable" approach at performing a state update:

```javascript
addProduct: action((state, payload) => {
  return {
    ...state,
    productIds: [
      ...state.productIds,
      payload
    ]
  };
})
```

Woah! Far more verbose, and harder to grok! That being said, if you prefer this immutable form you can disable the immer-based mutation form by setting the `disableImmer` [configuration](/docs/api/store-config.html) of the [createStore](/docs/api/create-store.html). You would then have to return new immutable state within your action handlers as you would within a standard Redux reducer.

Next up let's learn how to dispatch our [actions](/docs/api/action.html) from our components.

## Introducing the useStoreActions hook

We can access actions from our components via the [useStoreActions](/docs/api/use-store-actions.html) hook, which has the following signature.

```
useStoreActions(Actions => MappedAction)
```

The hook accepts a `mapActions` function. The `mapActions` function will be provided the [actions](/docs/api/action.html) of your [store](/docs/api/store.html) and should return the [action](/docs/api/action.html) required by your component.

## Dispatching actions from our components

We will now refactor our components to use the [useStoreActions](/docs/api/use-store-actions.html) hook, allowing them to dispatch [actions](/docs/api/action.html) to update our state.

**Product**

First up, we will update the `Product` component so that its `onAddToBasketClick` callback function will dispatch an [action](/docs/api/action.html) to add the respective product to the basket.

```javascript
// ...
import { useStoreActions, useStoreState } from 'easy-peasy';
//             👆 add the import

export default function Product({ id }) {
  //  map our action 👇
  const addProductToBasket = useStoreActions(
    actions => actions.basket.addProduct
  );

  // ...

  const onAddToBasketClick = useCallback(async () => {
    // ...
    addProductToBasket(product.id); // 👈 dispatch our action
    // ...
  }, [product]);

  return (
    <div>
      {/* ... */}
      <button onClick={onAddToBasketClick}>Add to basket</button>
    </div>
  );
}
```

Once you have updated your application accordingly you will be able to browse to a product and click the "Add to Basket" button. When doing so you should note that the basket count in the top right increases.

> Note: We have simulated a network delay for when you click the "Add to Basket" button.

**Basket**

Next up, let's update the `Basket` component so that we can dispatch the [action](/docs/api/action.html) to remove a product from our basket.

```javascript
// ...
import { useStoreActions, useStoreState } from 'easy-peasy';
//             👆 add the import

export default function Basket() {
  //  map our action 👇
  const removeProductFromBasket = useStoreActions(
    actions => actions.basket.removeProduct,
  );
  // ...

  return (
    <div>
      {/* ... */}
        {basketProducts.map((product, idx) => (
          {/* ... */}
          {/*                  dispatch the action 👇                      */}
          <button onClick={() => removeProductFromBasket(idx)}>Remove</button>
          {/* ... */}
        ))}
      {/* ... */}
    </div>
  );
}
```

After updating your application you should now be able to view the basket by clicking the link in the top right corner, and then remove a product from the basket via the "Remove" button next to each product.

## Review

Things are starting to get interesting now. We can influence the state of our application via [actions](/docs/api/action.html).

Earlier we noted that an emulated network call is being made when we add a product to our basket. Easy Peasy provides us with a mechanism to encapsulate side effects, such as API requests, within a [thunk](/docs/api/thunk.html). We will learn this API in the next section.

You can view the progress of our application refactor [here](https://codesandbox.io/s/easy-peasy-tutorial-actions-1e62s).

