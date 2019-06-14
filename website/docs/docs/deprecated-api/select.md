# select

Attach derived state (i.e. is calculated from other parts of your state) to your store.

The results of your selectors will be cached, and will only be recomputed if the state that they depend on changes. You may be familiar with `reselect` - this feature provides you with the same benefits.

## Arguments

  - selector (Function, required)

    The selector function responsible for resolving the derived state. It will be provided the following arguments:

    - `state` (Object, required)

      The local part of state that the `select` property was attached to.

    You can return any derived state you like.

    It also supports returning a function. This allows you to support creating a "dynamic" selector that accepts arguments (e.g. `productById(1)`). We will automatically optimise the function that you return - ensuring that any calls to the function will be automatically be memoised - i.e. calls to it with the same arguments will return cached results. This automatic memoisation of the function can be disabled via the `disableInternalSelectFnMemoize` setting on the `createStore`'s config argument.

  - dependencies (Array, not required)

    If this selector depends on data from other selectors then you should provide the respective selectors within an array to indicate the case. This allows us to make guarantees of execution order so that your state is derived in the manner you expect it to.

## Example

```javascript
import { select } from 'easy-peasy'; // 👈 import the helper

const store = createStore({
  shoppingBasket: {
    products: [{ name: 'Shoes', price: 123 }, { name: 'Hat', price: 75 }],
    // 👇 define your derived state
    totalPrice: select(state =>
      state.products.reduce((acc, cur) => acc + cur.price, 0)
    )
  }
};

// 👇 access the derived state as you would normal state
store.getState().shoppingBasket.totalPrice;
```

## Example with arguments

```javascript
import { select } from 'easy-peasy'; // 👈 import the helper

const store = createStore({
  products: [{ id: 1, name: 'Shoes', price: 123 }, { id: 2, name: 'Hat', price: 75 }],

  productById: select(state =>
    // 👇 return a function that accepts the arguments
    id => state.products.find(x => x.id === id)
  )
};

// 👇 access the select fn and provide its required arguments
store.getState().productById(1);

// This next call will return a cached result
store.getState().productById(1);
```

## Example with Dependencies

```javascript
import { select } from 'easy-peasy';

const totalPriceSelector = select(state =>
  state.products.reduce((acc, cur) => acc + cur.price, 0),
)

const netPriceSelector = select(
  state => state.totalPrice * ((100 - state.discount) / 100),
  [totalPriceSelector] // 👈 declare that this selector depends on totalPrice
)

const store = createStore({
  discount: 25,
  products: [{ name: 'Shoes', price: 160 }, { name: 'Hat', price: 40 }],
  totalPrice: totalPriceSelector,
  netPrice: netPriceSelector // price after discount applied
});
```
