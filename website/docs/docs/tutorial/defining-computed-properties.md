# Defining computed properties

Easy Peasy provides you with the ability to defined [computed](/docs/api/computed) properties - i.e. values that are derived from other state. This has many use cases and helps to avoid having duplicated state deriving logic spread across your application.

One example use case for this would be to calculate the total price for the products in a customers basket. We could define this computed property as below.

```javascript
import { computed } from 'easy-peasy';
//         👆 import the helper

const store = createStore({
  shoppingBasket: {
    products: [{ name: 'Shoes', price: 123 }, { name: 'Hat', price: 75 }],
    //            👇 define the computed property
    totalPrice: computed(state =>
      products.reduce((acc, cur) => acc + cur.price, 0)
    )
  }
}
```

Computed properties are optimised to only be calculated when they are accessed, i.e. lazy computation. In addition to this they cache their results, and will only recompute if their input state changes.

