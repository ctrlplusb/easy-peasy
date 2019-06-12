# Defining selectors to derive state

Earlier [we warned](/docs/tutorial/accessing-state.html#pitfalls) against performing state deriving operations within the [useStoreState](/docs/api/use-store-state) hook. If you haven't read about this pitfall then we _highly_ recommend that you [do so now](/docs/tutorial/accessing-state.html#pitfalls).

As a solution to your state deriving needs we recommend defining [selectors](/docs/api/selector) against your model. [Selectors](/docs/api/selector) provide you with a mechanism by which to define your derived state needs directly against your model, and allow you to reuse this logic across your application.

For example, say that you needed to calculate the total price of the products. This is the perfect opportunity for a [selector](/docs/api/selector).

```javascript
import { selector } from 'easy-peasy';

const store = createStore({
  shoppingBasket: {
    products: [{ name: 'Shoes', price: 123 }, { name: 'Hat', price: 75 }],
    totalPrice: selector(
      [state => state.products],
      (resolvedState) => {
        const [products] = resolvedState;
        return products.reduce((acc, cur) => acc + cur.price, 0);
      }
    )
  }
}
```

[Selectors](/docs/api/selector) require two arguments, the first argument being an array of "state resolvers". You use these to resolve the slices of your state that your [selectors](/docs/api/selector) will need to calculate the derived state. By doing this it allows us to provide a much higher level of performance optimisation around your selectors, as the cases in which we would need to recalculate them greatly reduces.

The second argument is the deriving function. It will receive the resolved state, as an array in the first argument. You can destructure this array and calculate the derived state as needed.

The above example may look a bit verbose compared to the rest of the Easy Peasy API, however, we came to a few comprimises in order to ensure that we can provide both the performance characteristics your application would need and flexibility of features around [selectors](/docs/api/selector) themselves. You can make the example a bit more concise by performing the array destructuring within the function argument, like below.

```javascript
selector(
  [state => state.products],
  ([products]) => products.reduce((acc, cur) => acc + cur.price, 0)
)
```

The array destructuring of the state resolvers along with the implicit return of the anonymous function do make your selectors far more concise, but do try to consider the value of this over readability.

[Selectors](/docs/api/selector) are memoized (cached) and will only be recalculated when the state that they operate against changes. These characteristics make them perfect to avoid the [pitfall we described earlier](/docs/tutorial/accessing-state.html#pitfalls) when using the [useStoreState](/docs/api/use-store-state) hook.
