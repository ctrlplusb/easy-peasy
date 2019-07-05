# Using Actions to update state

Our [application](https://codesandbox.io/s/easy-peasy-tutorial-component-state-28cjm) has the ability to consume state, but no way to update it.

In this section we will introduce the [action](/docs/api/action) which will allow us to do exactly this.

## Defining actions on our model

We are going to define two actions on our `basketModel`, namely to add or remove a product to/from our basket. Let's go ahead and update our `basketModel`.

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
    state.productIds.splice(payload);
  }),
};

export default basketModel;
```

Looking at the above you will not that we are defining actions directly against our model. Each action definition provides the handler function which will be used to handle the dispatched function. The handler receives the local state (in this case the basket model state) as well as any payload that was provided to the action when it was dispatched.

In addition to this you will see that we are mutating the state directly. 🙈

Don't worry! We use the amazing [immer](https://github.com/immerjs/immer) library under the hood, which allows us to take mutations and convert them into immutable based updates on our store. It may seem magic, but it is so much more convenient and less error prone.

> If the mutation API absolutely offends you, you can alternatively return the immutable form of updated state from your handler.

Next up let's learn how to dispatch our actions from our components.

## Introducing the useStoreActions hook

We can access actions from our components via the [useStoreActions](/docs/api/use-store-actions) hook. It has the following signature.

```
useStoreActions(Actions => MappedAction)
```

The hook accepts a mapping function. The mapping function will be provided the actions of your [store](/docs/api/store) and should return the action required by your component.

## Dispatching actions from our components

We will now use the [useStoreActions](/docs/api/use-store-actions) hook to update our components, allowing them to dispatch actions.

**Product**

First up, we will update the `Product` component so that its `onAddToBasketClick` callback function will dispatch our action to add the respective product to the basket.

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

> Note: We have simulated a network delay for when you click the "Add to Basket" button. Later in the tutorial we will revisit the code making the "network call".

**Basket**

Next up, let's update the `Basket` component so that we can dispatch the action to remove a product from our basket.

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

Things are starting to get interesting now. We can influence the state of our application via actions.

Earlier we talked about an emulated network call being made when we add a product to our basket. Easy Peasy provides us with a mechanism to encapsulate side effects, such as API requests, within a [thunk](/docs/api/thunk) action. We will learn this in the next section.

You can view the progress of our application refactor [here](https://codesandbox.io/s/easy-peasy-tutorial-actions-1e62s).

