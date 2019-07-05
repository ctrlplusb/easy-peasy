# Consuming state

Our [application](https://codesandbox.io/s/easy-peasy-tutorial-connect-store-1invi) has the store connected to it, but the components are not consuming the state from the store. @e can use Easy Peasy's [useStoreState](/docs/api/use-store-state) hook to do this.

> If you aren't familiar with hooks, we highly recommend that you read React's [official documentation](https://reactjs.org/docs/hooks-intro.html) on the subject. The documentation is really well written and will cover everything that you need to consider when using hooks based APIs.

## Introducing the useStoreState hook

The [useStoreState](/docs/api/use-store-state) hook has the following signature.

```
useStoreState(State => MappedState)
```

The hook accepts a mapping function. The mapping function will be provided the state of your [store](/docs/api/store) and should return the slice of state required by your component.

## Refactoring our components

We will now refactor each of the components that are currently directly importing data from the `src/data.js` file to instead consume our [store](/docs/api/store) state.

> To keep things concise we won't show the full source of the components, instead focusing on the changes that you will need to make within each of them. When you see a `...` in the example code, it indicates that some of the source code has been omitted.

**BasketCount**

First up, the `BasketCount` component.

```javascript
// src/components/basket-count.js

// ...
import { useStoreState } from "easy-peasy"; // 👈 import the hook

export default function BasketCount() {
  //       👇  map the state from store
  const basketCount = useStoreState(state => state.basket.productIds.length);
  // ...
```

**Basket**

Next, we will refactor the `Basket` component.

```javascript
// src/components/basket.js

// ...
import { useStoreState } from "easy-peasy"; // 👈 import the hook

export default function Basket() {
  //       👇  map the state from store
  const basketProducts = useStoreState(state =>
    // take the product ids from our basket...
    state.basket.productIds.map(productId =>
      // and map them to products
      state.products.items.find(product => product.id === productId)
    )
  );
  // ...
```

The above mapping function looks fairly complicated, it is performing a fair amount of state deriving. Later on in the tutorial we learn an API that can help us with this type of derived data.

**ProductList**

Now we will refactor the `ProductList` component.

```javascript
// src/components/product-list.js

// ...
import { useStoreState } from "easy-peasy"; // 👈 import the hook

export default function ProductList() {
  //       👇  map the state from store
  const products = useStoreState(state => state.products.items);
  // ...
```

**Product**

Finally, we will refactor the `Product` component.

```javascript
// src/components/product.js

// ...
import { useStoreState } from "easy-peasy"; // 👈 import the hook

export default function Product({ id }) {
  //       👇  map the state from store
  const product = useStoreState(
    state => state.products.items.find(product => product.id === id)
  );
  // ...
```

This is another example of our `mapState` function performing some state deriving, however, in this case we are also using an incoming `id` prop within the state deriving process. Once again the API that we will introduce later will help with this.

## A note on optimisation

Under the hood the [useStoreState](/docs/api/use-store-state) will execute its `mapState` function any time an update to your [store's](/docs/api/store) state occurs. It will then check the result of the newly mapped state against the previously mapped state using strict equality (`===`) checking.

If the newly mapped state _is not equal_ to the previously mapped state (`nextMappedState !== prevMappedState`) your component will be rendered, receiving the new value. If the newly mapped state _is equal_ to the previously mapped state (`nextMappedState === prevMappedState`) no render will occur.

With this in mind you should take care not to return a new Array or Object within your `mapState` function as these will break the equality check, forcing your component to render for _any_ state update across your store.

An example.

```javascript
function MyComponent() {
  const productNames = useStoreState(
    //                       👇 Array.map returns a new array instance!
    state => state.products.map(product => product.name)
  );
  // ...
}
```

`Array.map` returns a new array instance - therefore `nextMappedState` will never be equal to `prevMappedState`.

This performance pitfall is described within the [useStoreState](/docs/api/use-store-state) documentation along with recommendations on how you can avoid it. Later on in this tutorial we will cover some of these techniques so you need not go read the [useStoreState](/docs/api/use-store-state) documentation right now.

## Review

Awesome sauce, our components are hooked up to our [store's](/docs/api/store) state! As amazing as that is, our application is essentially static right now, with no ability to update our [store's](/docs/api/store) state.

In the next section we'll look into how we can use [actions](/docs/api/action) in order to support updates.

You can view the progress of our application refactor [here](https://codesandbox.io/s/easy-peasy-tutorial-component-state-28cjm).