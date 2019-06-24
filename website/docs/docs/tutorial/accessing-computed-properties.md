# Accessing computed properties

You can access a [computed](/docs/api/computed) property in the same manner as other state, i.e. via the [useStoreState](/docs/api/use-store-state) hook

```javascript
import { useStoreState } from 'easy-peasy';

function TotalPriceOfProducts() {
  const totalPrice = useStoreState(state => state.products.totalPrice));
  return <div>Total: {totalPrice}</div>);
};
```

## Accessing selectors directly via the store

You can additionally access your [computed](/docs/api/computed) property from the [store's](/docs/api/store) `getState` API.

```javascript
store.getState().shoppingBasket.totalPrice;
```