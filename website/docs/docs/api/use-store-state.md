# useStoreState

A [hook](https://reactjs.org/docs/hooks-intro.html) granting your components access to the [store's](/docs/api/store.html) state.

```javascript
const todos = useStoreState(state => state.todos.items);
```

## Arguments

  - `mapState` (Function, *required*)

    The function that is used to resolve the piece of state that your component requires. The function will receive the following arguments:

    - `state` (Object)

      The state of your store.

  - `equalityFn` (Function, *optional*)

    Allows you to provide custom logic for determining whether the mapped state has changed.

    ```javascript
    useStoreState(
      state => state.user,
      (prev, next) => prev.username === next.username
    )
    ```

    It receives the following arguments:

    - `prev` (any)

      The state that was previously mapped by your selector.

    - `next` (any)

      The newly mapped state that has been mapped by your selector.

    It should return `true` to indicate that there is no change between the prev/next mapped state, else `false`. If it returns `false` your component will be re-rendered with the most recently mapped state value.


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

## Potential Pitfalls

The [useStoreState](/docs/api/use-store-state.html) hook runs a performance optimisation where it checks to see if mapped state has changed when your store has updated. It uses strict equality checking to check if the next mapped state is equal to the previously mapped state (i.e. `prevMappedState === nextMappedState`). If the newly mapped state doesn't match the previously mapped state your component will re-render.

If your `mapState` returns a new _reference_ based value (i.e. an array or an object) when it is executed your component will likely render for _any_ state change on your store.

Let's illustrate this pitfall via the following example.

```javascript
function AntiPattern() {
  const stuff = useStoreState(state => {
    //      👇 returning a new object instance within our mapState
    return  { thing1: state.thing1, thing2: state.thing2 };
  });
  return (
    <div>
      I will re-render any time any state update happens across the store!
    </div>
  );
}
```

Note how a new object is being returned within the state mapper. This breaks strict equality checking, forcing your component to re-render for _any_ state change on your [store](/docs/api/store.html).

For this case we recommend that you map the required states in separate `useStoreState` hook calls.

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
    // Array.map produces a new array instance
    //                           👇
    return state.products.items.map(product => product.name);
  });
  return (
    <ul>
      {productNames.map(name => <li>{name}</li>)}
    </ul>
  );
}
```

In this case you are returning a new array instance within your `mapState`, which breaks the strict equality checking. For this case we recommend one of two options.

**1. Use React's [useMemo](https://reactjs.org/docs/hooks-reference.html#usememo) hook**

Using the [useMemo](https://reactjs.org/docs/hooks-reference.html#usememo) hook we can ensure our product names mapping only runs if the products have changed.

```javascript
import { useMemo } from 'react';

function FixedOptionOne() {
  const products = useStoreState(state => state.products.items);
  const productNames = useMemo(
    // We move our state deriving out of the useStoreState hook
    //       👇
    () => products.map(product => product.name),
    [products] // 👈 tell React to rerun useMemo when products change
  );
  return (
    <ul>
      {productNames.map(name => <li>{name}</li>)}
    </ul>
  );
}
```

**2. Define a [computed](/docs/api/computed.html) property**

The alternative solution would be to define a [computed](/docs/api/computed.html) property. This can be a handy solution especially if you expect product names to be used within multiple locations of your application - this would then avoid you having duplicated logic spread through your application that derives state.

```javascript
const store = createStore({
  products: {
    items: [],
    // defining a computed property
    //   👇          👇 
    productNames: computed(state => state.items.map(product => product.name))
  }
});

function FixedOptionTwo() {
  //                                                             👇
  const productNames = useStoreState(state => state.products.productNames);
  return (
    <ul>
      {productNames.map(name => <li>{name}</li>)}
    </ul>
  );
}
```

## Using the `shallowequal` package to support mapping multiple values

You can utilise the [`shallowequal`](https://github.com/dashed/shallowequal) to support mapping multiple values out via an object. The `shallowequal` package will perform a shallow equality check of the prev/next mapped object.

```javascript
import { useStoreState } from 'easy-peasy';
import shallowEqual from 'shallowequal';

function MyComponent() {
  const { item1, item2 } = useStoreState(
    state => ({
      item1: state.items.item1,
      item2: state.items.item2,
    }),
    shallowEqual // 👈 we can just pass the reference as the function signature 
                 //    is compatible with what the "equalityFn" argument expects
  )
}
```