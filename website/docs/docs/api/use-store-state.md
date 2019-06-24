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
    return  { thing1: state.thing1, thing2: state.thing2 };
  });
  return (
    <div>
      I will re-render any time any state update happens across the store!
    </div>
  );
}
```

Note how a new object is being returned within the state mapper. This will occur every time the state mapper is executed, and  breaks strict equality checking, forcing your component to re-render for _any_ state change on your [store](/docs/api/store).

For this case we recommend that you map the required states individually.

```javascript
function Fixed() {
  const thing1 = useStoreState(state => state.thing1);
  const thing2 = useStoreState(state => state.thing2);
  return <div>I am optimised</div>;
}
```

Another case may be that you wish to derive some state, for example, perhaps you would like the names of products only.

```javascript
function AntiPatternTwo() {
  const productNames = useStoreState(state => {
    return state.products.items.map(product => product.name);
  });
  return (
    <ul>
      {productNames.map(name => <li>{name}</li>)}
    </ul>
  );
}
```

In this case you are returning a new array instance every time the state mapper executes, again breaking the strict equality checking. For this case we recommend one of two options.

**1. Use React's [useMemo](https://reactjs.org/docs/hooks-reference.html#usememo) hook**

Using the [useMemo](https://reactjs.org/docs/hooks-reference.html#usememo) we can ensure our product names mapping only re-runs if the actual product items have changed.

```javascript
import { useMemo } from 'react';

function FixedOptionOne() {
  const products = useStoreState(state => state.products.items);
  const productNames = useMemo(
    () => products.map(product => product.name),
    [products] // 👈 tell React to rerun useMemo every time products changes
  );
  return (
    <ul>
      {productNames.map(name => <li>{name}</li>)}
    </ul>
  );
}
```

**2. Define a [computed](/docs/api/computed) property**

The alternative solution would be to define a [computed](/docs/api/computed) property to represent the product names. This can be a handy solution especially if you expect product names to be used within multiple locations of your application - this would then avoid you having duplicated logic spread through your application

```javascript
const store = createStore({
  products: {
    items: [],
    // 👇 defining a computed property
    productNames: computed(state => state.items.map(product => product.name))
  }
});

function FixedOptionTwo() {
  const productNames = useStoreState(state => state.products.productNames);
  return (
    <ul>
      {productNames.map(name => <li>{name}</li>)}
    </ul>
  );
}
```
