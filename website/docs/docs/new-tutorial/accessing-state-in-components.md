# Accessing state within components

Now that we have our application hooked up to our store we are able to consume the [store](/docs/api/store) state within our components. We can do so via the [useStoreState](/docs/api/use-store-state) hook.

> If you aren't familiar with hooks, we highly recommend you read Reacts [official documentation](https://reactjs.org/docs/hooks-intro.html) on them.

The [useStoreState](/docs/api/use-store-state) hook accepts a mapping function, which will receive the state for your store, and requires you to return the piece of state you would like to use.

## Connecting the `ProductList` component

Let's refactor our `ProductList` component to consume our [store](/docs/api/store) state.

```javascript
import { useStoreState } from 'easy-peasy';
//           👆 import the hook

function ProductList() {
  //              We map the product items from our state 👇
  const products = useStoreState(state => state.products.items);
  return (
    <ul>
      {products.map(product => <li>{product.name}</li>)}
    </ul>
  );
}
```

Note how we mapped out our products and then rendered it within an unordered list. Any time that the products are updated the [useStoreState](/docs/api/use-store-state) hook will return the new value, allowing our component to re-render with the new list of products.

It's important that you keep your state mappers simple. The [useStoreState](/docs/api/use-store-state) hook uses strict equality checking to determine if our mapped state has changed (i.e. `prevMapState === nextMappedState`). Therefore if you perform an operation within your state mapper that resolves a new array or object instance your component may fall victim to unnecessary re-rendering. We discuss this within the pitfalls section of the [action](/docs/api/action) API.

## Creating a component to render a single product

We can leverage props within our [useStoreState](/docs/api/use-store-state) hook to help isolate a piece of state. When doing so it is important to add the respective props to the `dependencies` argument of our [useStoreState](/docs/api/use-store-state) hook. By doing this our [useStoreState](/docs/api/use-store-state) hook will track the prop and ensure that it executes the state mapper any time the respective props change.

Let's create a component that allows us to view a product.

```javascript
import { useStoreState } from 'easy-peasy';

function Product({ id }) {
  const product = useStoreState(
    state => state.products.items.find(product => product.id === id),
    [id] // 👈 add our prop to the dependency
  );
  return (
    <div>
      <h2>{product.name}</h2>
      <strong>{product.price}</strong>
    </div>
  );
}
```

## Demo Application

You can view the progress of our demo application [here](#).