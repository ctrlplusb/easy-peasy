# computed

Allows you to bind a [computed](/docs/api/computed.html) property against your model by providing a computation function that will take in state and return a derived value. Computed state can be accessed like any other state on your store.

The computation process is only performed when the property is accessed, i.e. lazy computation. This allows for good performance characteristics. In addition to this the results of [computed](/docs/api/computed.html) properties are cached, and will only be recomputed if their input state has changed.

```javascript
isLoggedIn: computed(state => state.user != null)
```

## Arguments

- `stateResolvers` (Array\<Function\>, *optional*)

  > Note: this is an optional parameter, you can omit it and instead just provide a `computationFunc`.

  State resolvers allows you to isolate the specific parts of your state as inputs to your computation function. They also have the added benefit of being able to expose the entire store state to your computed property. Each state resolver function receives the following arguments:

  - `state` (Object)

    The local state against which your [computed](/docs/api/computed.html) property is bound.

  - `storeState` (Object)

    The entire store state

  In general it is recommended that you only use state resolvers if you need to resolve state from another part of your model. There are some performance benefits to be had by isolating local state, but in almost every case this would be insignificant.

  It is also worth noting that the `state` and `storeState` that are provided to your state resolvers will include [computed](/docs/api/computed.html) properties too. Computed properties are allowed to reference each other.

- `computationFunc` (Function, *required*)

  The `computationFunc` that will receive the input state and return the derived value. If no `stateResolvers` were defined the `computationFunc` will receive the local state as its input.

## Simple computed property

This is the simplest form of computed properties, and the form that should be used in most cases.

```javascript
const model = {
  session: {
    user: { username: 'bob' },
    isLoggedIn: computed(state => state.user != null)
  }
}
```

## Utilising state resolvers

In this example we will use state resolvers to isolate different parts of our store state.

```javascript
const model = {
  products: {
    items: {
      1: { id: 1, name: 'boots', price: 20 }
    },
  },
  basket: {
    productIds: [1],
    productsInBasket: computed(
      [
        state => state.productIds,
        //          👇 the store state is the 2nd argument to a state resolver
        (state, storeState) => storeState.products.items
      ],
      (productIds, products) => productIds.map(id => products[id])
    )
  }
}
```

## Supporting runtime arguments

You can return a function from your computed property to support runtime arguments.

```javascript
const todos = {
  items: [{ id: 1, text: 'answer questions' }],
  // Note how we are returning a function instead of state
  //                          👇
  todoById: computed(state => id => state.items.find(todo => todo.id === id))
}
```

You can then use the function based property similar to the deprecated selector.

```javascript
function Todo({ id }) {
  //                                      execute the todo 👇
  const todo = useStoreState(state => state.todos.todoById(id));
  return todo ? <div>{todo.text}</div> : null;
}
```

You can even memoize your functions by utilising the `memo` helper.

```javascript
import { memo } from 'easy-peasy';

const todos = {
  items: [{ id: 1, text: 'answer questions' }],
  // Wrap your function with memo and set the cache size
  //                          👇
  todoById: computed(state => memo(
    id => state.items.find(todo => todo.id === id),
    100 // 👈 cache size
  ))
}
```

## Accessing via a component

You access computed properties in the same manner as any other state within your components, i.e. via the [useStoreState](/docs/api/use-store-state.html) hook. Any updates to our [computed](/docs/api/computed.html) property, i.e. the input state to our [computed](/docs/api/computed.html) property changed, will automatically re-render your component.

```javascript
import { useStoreState } from 'easy-peasy';

function TotalPriceOfProducts() {
  const totalPrice = useStoreState(state => state.products.totalPrice);
  return <div>Total: {totalPrice}</div>
}
```

## Accessing via the store instance

You can also access the computed property via the [store's](/docs/api/store.html) `getState` API.

```javascript
console.log(store.getState().products.totalPrice);
```

## Known Issues

### TypeScript: Defining a computed property as optional

Unfortunately, due to the way our typing system maps your model, you cannot declare a computed property as being optional via the `?` property postfix.

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

Luckily there is a workaround; simply adjust the definition of your computed property to indicate that the result could be undefined.

```diff
  interface StoreModel {
    products: Product[];
-   totalPrice?: Computed<StoreModel, number>;
+   totalPrice: Computed<StoreModel, number | undefined>;
  }
```

### Computed properties break when destructuring a computed property out of state

Say you had a computed property defined in your model like below.

```javascript
const storeModel = {
  session: {
    user: null,
    isLoggedIn: computed(state => state.user != null)
  }
}
```

If you destructure the computed property when accessing it in your component, like below, it will not work.

```javascript
function LoggedInBadge() {
  const { isLoggedIn } = useStoreState(state => state.session);
  return isLoggedIn ? <LoggedInSvg /> : <LoggedOutSvg />;
}
```

This is because computed properties are in actual fact [getter properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get). If you destructure the property you break the getter mechanism. Therefore you may not receive updates to your computed property based on when the state that your computed property depends on updates.

The resolution to this is to instead resolve the computed property directly.

```javascript
function LoggedInBadge() {
  const isLoggedIn = useStoreState(state => state.session.isLoggedIn);
  return isLoggedIn ? <LoggedInSvg /> : <LoggedOutSvg />;
}
```
