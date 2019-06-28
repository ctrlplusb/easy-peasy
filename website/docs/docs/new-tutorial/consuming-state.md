# Consuming state

In order to access the [store](/docs/api/store) state from our components we will make use of the [useStoreState](/docs/api/use-store-state) hook that is bundled with Easy Peasy. If you aren't familiar with hooks, we highly recommend you read the [official documentation](https://reactjs.org/docs/hooks-intro.html) on them.

## Introducing the useStoreState hook

The [useStoreState](/docs/api/use-store-state) hook has the following signature.

```
useStoreState(State => MappedState, Dependencies[])
```

As you can see the hook accepts a mapping function and can optionally receive an array of dependencies. The mapping function will be provided the state of your [store](/docs/api/store) and should return the piece of state required by your component. 

## An important note on optimisation

Under the hood the [useStoreState](/docs/api/use-store-state) will execute any time an update to your [store's](/docs/api/store) state occurs. It will then check the newly mapped state vs the previously mapped state using strict equality (`===`) checking. If the newly mapped state is not equal to the previously mapped state your component will be re-rendered with the new value. If the newly mapped state is equal to the previously mapped state no re-render will occur.

Once again, we want to highlight that strict equality checking is used. 

```javascript
const willRerender = prevMappedState !== nextMappedState;
```

Returning a new array instance or an object from your mapping function is considered an anti-pattern as this will always break the strict equality check, which will result in your component re-rendering for _any_ state update.

An example.

```javascript
function MyComponent() {
  const productNames = useStoreState(
    //                       👇 OH NOES!                
    state => state.products.map(product => product.name)
  );
  // ...
}
```

`Array.map` returns a new array instance - therefore `nextMappedState` will never be equal to `prevMappedState`. 

For these cases we recommend that you do one of two things:

1. Return the natural state and perform the operation (e.g. `Array.map`) outside of the hook;
2. Introduce a [computed](/docs/api/computed) property.

[Computed](/docs/api/computed) properties will be covered later in the tutorial.

## Refactoring our components

Now we will refactor each of our components so that they will use our [store's](/docs/api/store) state.

First up, the `BasketCount` component.

```javascript
// src/components/basket-count.js

import React from "react";
import { Link } from "react-router-dom";
import { useStoreState } from "easy-peasy"; // 👈 import the hook

export default function BasketCount() {
  //       👇  map the state from store
  const basketCount = useStoreState(state => state.basket.productIds.length);
  return (
    <div className="BasketCount">
      <Link to="/basket">Basket({basketCount} items)</Link>
    </div>
  );
}
```

Next, we will refactor the `Basket` component.

```javascript
import React from "react";
import { Link } from "react-router-dom";
import { useStoreState } from "easy-peasy"; // 👈 import the hook

export default function Basket() {
  //       👇  map the state from store
  const basketProducts = useStoreState(state =>
    state.basket.productIds.map(productId =>
      state.products.items.find(product => product.id === productId)
    )
  );
  return (
    <div>
      <h2>The merchandise</h2>
      <ul>
        {basketProducts.map(product => (
          <li key={product.id}>
            <Link to={`/product/${product.id}`}>{product.name}</Link>{" "}
            <button>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Now we will refactor the `ProductList` component.

```javascript
import React from "react";
import { Link } from "react-router-dom";
import { useStoreState } from "easy-peasy"; // 👈 import the hook

export default function ProductList() {
  //       👇  map the state from store
  const products = useStoreState(state => state.products.items);
  return (
    <div>
      <h2>Our products</h2>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Finally, we will refactor the `Product` component.

```javascript
import React, { useCallback, useState } from "react";
import { useStoreState } from "easy-peasy"; // 👈 import the hook
import * as basketService from "../services/basket-service";

export default function Product({ id }) {
  //       👇  map the state from store
  const product = useStoreState(
    state => state.products.items.find(product => product.id === id),
    [id]  // 👈 declare the external value as a dependency
  );

  // state to track when we are saving to basket
  const [adding, setAdding] = useState(false);

  // callback to handle click, saving to basket
  const onAddToBasketClick = useCallback(async () => {
    setAdding(true);
    await basketService.addProductToBasket(product.id);
    setAdding(false);
  }, [product]);

  return (
    <div>
      <h2>{product.name}</h2>
      <p>
        <em>£ {product.price}</em>
      </p>
      {adding ? (
        "Adding..."
      ) : (
        <button onClick={onAddToBasketClick}>Add to basket</button>
      )}
    </div>
  );
}
```

Note that within our `Product` component we are depending on a value external to our mapping function, namely the `id` prop. When we consume a value that is external to our mapping function we need to declare that value within the dependencies argument of the [useStoreState](/docs/api/use-store-state) hook. Doing this ensures that our hook we fire every time the value of the dependency changes.

