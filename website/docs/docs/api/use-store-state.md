# useStoreState

A [hook](https://reactjs.org/docs/hooks-intro.html) granting your components access to the [store's](/docs/api/store) state.

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

Keep your state mappers very simple - don't perform operations against your state within them. This is important as the [useStoreState](/docs/api/use-store-state) hook runs a performance optimisation where it checks to see if the mapped state has changed at all. It uses strict equality checking to check if the next mapped state is equal to the previously mapped state (i.e. `prevMappedState === nextMappedState`). If the newly mapped state doesn't match the previously mapped state your component will re-render.

Therefore if you perform an operation within your map state that always produces a new value (e.g. a new array/object) your component will re-render for _any_ state change.

Let's illustrate this pitfall via the following example.

```javascript
function AntiPattern() {
  const stuff = useStoreState(state => {
    return [state.thing1, state.thing2];
  });
  return (
    <div>
      I will re-render any time any state update happens across the store!
    </div>
  );
}
```

Note how an array is being returned within the state mapper. A new array will be returned every time the state mapper is executed. This breaks strict equality checking, forcing your component to re-render for _any_ state change on your [store](/docs/api/store).

We recommend two alternative approaches to avoid this.

**1. Resolve slices of state individually**

```javascript
function Fixed() {
  const thing1 = useStoreState(state => state.thing1);
  const thing2 = useStoreState(state => state.thing2);
  return <div>I am optimised</div>;
}
```

**2. Define a [selector](/docs/api/selector) for derived state**

For example, perhaps you want to map an array of products to an array containing only their names.

```javascript
const store = createStore({
  products: [],
  productNames: selector(
    [state => state.products],
    ([products]) => products.map(product => product.name)
  )
});

const productNames = useStoreState(state => state.productNames());
```

We cover [selectors](/docs/api/selector) in more detail later in the tutorial.
