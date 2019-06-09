# Accessing selectors

To access your selectors you use the `useStoreState` hook.

```javascript
import { useStoreState } from 'easy-peasy';

function TotalPriceOfProducts() {
  const totalPrice = useStoreState(state => state.products.totalPrice));
  return <div>Total: {totalPrice()}</div>);
};
```

It's important to note above that we had to actually execute the selector to
get the derived state result. We intentionally designed selectors to be functions
as it allows us to provide performance guarantees. In addition to this, having
selectors be functions allows us to support providing runtime arguments to
them.

## Accessing selectors directly via the store

You can access your selector similar to state.

```javascript
store.getState().shoppingBasket.totalPrice(); // A fresh hit

store.getState().shoppingBasket.totalPrice(); // Cached result returned
```
