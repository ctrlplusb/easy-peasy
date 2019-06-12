# Providing runtime arguments to selectors

[Selectors](/docs/api/selector) support runtime arguments, allowing you to influence your state deriving operations.

For example, say you wanted a selector to return the price for a specific product.

```javascript
const productsModel = {
  items: {
    1: { id: 1, text: 'Spoon', price: 123 }
  },
  priceById: selector(
    [state => state.items],
    // Runtime args will be received as the 2nd argument to your deriving function
    //                  👇
    (resolvedState, runtimeArgs) => {
      const [items] = resolvedState;
      const [productId] = runtimeArgs;
      return items[productId] ? items[productId].price : undefined;
    }
  )
}
```

You can then use the selector within your component like so.

```javascript
function ProductPrice({ productId }) {
  const price = useStoreState(
    state => state.products.priceById(productId),
    [productId]
  );
  return price ? <div>{price}</div> : null;
}
```

In the example above we are passing the prop into our selector, thereby exposing it as a runtime argument to our [selector](/docs/api/selector). It's important to note that as we are depending on an external value, the `productId` prop, we had to declare it as a dependency to our [useStoreState](/docs/api/use-store-state) hook. This ensures that the map state will be executed any time that the `productId` changes.