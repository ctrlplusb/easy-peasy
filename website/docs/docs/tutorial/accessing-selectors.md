# Accessing selectors

Use the [useStoreState](/docs/api/use-store-state) hook to access your [selectors](/docs/api/selector).

```javascript
import { useStoreState } from 'easy-peasy';

function TotalPriceOfProducts() {
  const totalPrice = useStoreState(state => state.products.totalPrice()));
  return <div>Total: {totalPrice}</div>);
};
```

It's important to note that your [selector](/docs/api/selector) is a function, requiring execution in order to get the derived state. We intentionally designed [selectors](/docs/api/selector) to be functions as it allows us to provide performance guarantees. In addition to this, having [selectors](/docs/api/selector) be functions allows us to support providing runtime arguments to them.

> You can execute the selector inside or outside of your state mapper. The performance characteristics will remain the same.

## Accessing selectors directly via the store

You can access your [selector](/docs/api/selector) similar to state.

```javascript
store.getState().shoppingBasket.totalPrice(); // A fresh hit

store.getState().shoppingBasket.totalPrice(); // Cached result returned
```
