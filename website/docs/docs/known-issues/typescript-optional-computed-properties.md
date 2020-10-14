# Marking computed properties as optional on your TypeScript model

Unfortunately, due to the way our typing system maps your model, you cannot
declare a computed property as being optional via the `?` property postfix.

For example:

```typescript
interface StoreModel {
  products: Product[];
  totalPrice?: Computed<StoreModel, number>;
  //       👆
  // Note the optional definition
}

const storeModel: StoreModel = {
  products: [];
  // This will result in a TypeScript error 😢
  totalPrice: computed(
    state => state.products.length > 0
      ? calcPrice(state.products)
      : undefined
  )
}
```

Luckily there is a workaround; simply adjust the definition of your computed
property to indicate that the result could be undefined.

```diff
  interface StoreModel {
    products: Product[];
-   totalPrice?: Computed<StoreModel, number>;
+   totalPrice: Computed<StoreModel, number | undefined>;
  }
```
