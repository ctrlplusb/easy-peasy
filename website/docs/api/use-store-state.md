# useStoreState

A [hook](https://reactjs.org/docs/hooks-intro.html) granting your components access to the store's state.

```javascript
const todos = useStoreState(state => state.todos.items);
```

## Arguments

  - `mapState` (Function, required)

    The function that is used to resolved the piece of state that your component requires. The function will receive the following arguments:

    - `state` (Object, required)

      The state of your store.

  - `externals` (Array of any, not required)

    If your `useStoreState` function depends on an external value (for example a property of your component), then you should provide the respective value within this argument so that the `useStoreState` knows to remap your state when the respective externals change in value.

## Example

```javascript
import { useStoreState } from 'easy-peasy';

const BasketTotal = () => {
  const totalPrice = useStoreState(state => state.basket.totalPrice);
  const netPrice = useStoreState(state => state.basket.netPrice);
  return (
    <div>
      <div>Total: {totalPrice}</div>
      <div>Net: {netPrice}</div>
    </div>
  );
};
```

## Pitfalls

Please be careful in the manner that you resolve values from your `mapToState`. To optimise the rendering performance of your components we use referential equality checking (===) to determine if the mapped state has changed. When an update to
your stores state occurs we will run your mapping function again, and if the new
value does not equal to the previously mapped value we will rerender your
component.

Therefore, if you perform an operation that always returns a new value (for e.g.
an array) is an anti-pattern as it will break our equality checks, causing our
components to rerender for _any_ state change.

Here is an illustrative example.

```javascript                                                     👇
const productNames = useStoreState(state => state.products.map(x => x.name))
```

Using `.map` produces a new array instance every time it is called. So
`prevProductNames !== nextProductNames`.

You have two options to solve the above.

Firstly, you could just return the products and then do the `.map` outside of your `mapState`:

```javascript
const products = useStoreState(state => state.products)
const productNames = products.map(x => x.name)
```

A better approach is to define a [selector](#todo) against your model.

```javascript
import { selector, createStore } from 'easy-peasy';

const createStore = ({
  products: [{ name: 'Boots' }],
  productNames: selector(
    [state => state.products],
    ([products]) => products.map(x => x.name)
  )
});
```

And then use it like so:

```javascript
const productNames = useStoreState(state => state.productNames());
```
