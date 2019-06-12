# Defining selectors

Earlier we warned against doing operations against your state within the state
mapper you provide to the `useStoreState` hook.

To derive state we recommend that you define a selector against your model.

For example, say you wanted to derive the total price of the products that
are currently in your state.

```javascript
import { selector } from 'easy-peasy';

const store = createStore({
  shoppingBasket: {
    products: [{ name: 'Shoes', price: 123 }, { name: 'Hat', price: 75 }],
    totalPrice: selector(
      [state => state.products],
      (products) => products.reduce((acc, cur) => acc + cur.price, 0)
    )
  }
}
```

Selectors require two arguments, the first argument being an arr array of
"state resolvers". You use these to resolve the slices of your state
that your selector will need to calculate the derived state.

The second argument is the deriving function. It will receive the resolved state
and should return the derived state.

The results of selectors are memoized and will only be recalculated when the
state that they operate against changes. This provides a nice performance
optimisation, helping to avoid unneccessary rerendering of your React components.

> Selectors are inspired by [`reselect`](https://github.com/reduxjs/reselect).
