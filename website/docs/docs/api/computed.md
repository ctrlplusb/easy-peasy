# computed

Allows you to bind a [computed](/docs/api/computed) property against your model by providing a computation function that will take in state and return a derived value. Computed state can be accessed like any other state on your store.

The computation process is only performed when the property is accessed, i.e. lazy computation. This allows for good performance characteristics. In addition to this the results of [computed](/docs/api/computed) properties are cached, and will only be recomputed if their input state has changed.

```javascript
isLoggedIn: computed(state => state.user != null)
```

## Arguments

- `computationFunc` (Function, *required*)

The `computationFunc` that will receive the input state and return the derived value.

- `stateSelectors` (Array\<Function\>, *optional*)

  State selectors allows you to isolate the specific parts of your state as inputs to your computation function. Each state selector function receives the following arguments:

  - `state` (Object)

    The local state against which your [computed](/docs/api/computed) property is bound.

  - `storeState` (Object)

    The entire store state

  In general it is recommended that you only use state selectors if you need resolve store state, i.e from another part of your model. There are some performance benefits to be had by isolating local state, but in almost every case this would be insignificant.

  It is also worth noting that the `state` and `storeState` that are provided to your state selectors will include [computed](/docs/api/computed) properties too. Computed properties are allowed to reference each other.

## Defining computed properties

This section will demonstrate various use cases in terms of defining [computed](/docs/api/computed) properties.

### Simple computed property acting against local state

In this example we will use the local state, which is provided as the input to our computation function, in order to resolve the `isLoggedIn` value.

```javascript
const model = {
  session: {
    user: { username: 'bob' },
    isLoggedIn: computed(state => state.user != null)
  }
}
```

### A computed property isolating local state via a state resolver

In this example we will isolate the `items` of our local state using a state resolver function. Note how the resolved state becomes the input to our computation function.

```javascript
const model = {
  products: {
    items: [{ name: 'boots', price: 20 }],
    totalPrice: computed(
      items => items.reduce((total, product) => total + product.price, 0),
      [state => state.items]
    )
  }
}
```

### A computed property isolating multiple parts of local state via a state resolver

In this example we will use multiple state resolvers in order to isolate multiple parts of our local state. Note how each state resolver result becomes an argument to our computation function.

```javascript
const model = {
  todos: {
    items: {
      1: { id: 1, text: 'learn easy peasy' }
    },
    idsOfCompleted: [1],
    completedTodos: computed(
      (items, idsOfCompleted) => idsOfCompleted.map((id) => items[id]),
      [
        state => state.items,
        state => state.idsOfCompleted
      ]
    )
  }
}
```

### A computed property using state resolvers to resolve store state

In this example we will use a state resolver to isolate a part of our store state, i.e. state that isn't local to our [computed](/docs/api/computed) property.

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
      (productIds, products) => productIds.map(id => products[id]),
      [
        state => state.productIds,
        //          👇 the store state is the 2nd argument to a state resolver
        (state, storeState) => storeState.products.items
      ]
    )
  }
}
```

### Using other computed properties within a computed property

In this example we will use another [computed](/docs/api/computed) property within a [computed](/docs/api/computed) property.

```javascript
const model = {
  products: {
    items: {
      1: { id: 1, name: 'boots', price: 20, stock: 3 }
    }
  },
  productList: computed(state => Object.values(state.products)),
  productsWithLowStock: computed(
    //                 👇 referencing the computed property from above
    state => state.productList.filter(product => product.stock < 5)
  )
}
```

## Accessing computed properties

Now we will cover the various ways you can consume [computed](/docs/api/computed) properties within your application.

### Accessing via a component

You access computed properties in the same manner as any other state within your components, i.e. via the [useStoreState](/docs/api/use-store-state) hook. Any updates to our [computed](/docs/api/computed) property, i.e. the input state to our [computed](/docs/api/computed) property changed, will automatically re-render your component.

```javascript
import { useStoreState } from 'easy-peasy';

function TotalPriceOfProducts() {
  const totalPrice = useStoreState(state => state.products.totalPrice);
  return <div>Total: {totalPrice}</div>
}
```

### Accessing via the store instance

You can also access the computed property via the [store's](/docs/api/store) `getState` API.

```javascript
console.log(store.getState().products.totalPrice);
```

## Runtime arguments

You can support runtime arguments, by resolving a function within your [computed](/docs/api/computed) properties.

For example, let's create a [computed](/docs/api/computed) property that allows you to request a specific number of todo items.

```javascript
const todosModel = {
  items: [],
  firstXTodos: computed(state => 
    num => state.items.slice(0, num) // 👈 resolving a function that accepts "num"
  )
}
```

You could then use this in your components like so.

```javascript
import { useStoreState } from 'easy-peasy';

function FirstXTodos({ num }) {
  const todos = useStoreState(
    state => state.todos.firstXTodos(num), // 👈 note how we execute the fn
    [num]
  );
  return <div>...</div>;
}
```

### Memoising your runtime arg functions

Easy Peasy exports a [memo](/docs/api/memo) which allows you to easily memoise your [computed](/docs/api/computed) property runtime arg functions. Lets refactor the example from above to do so.

```javascript
import { memo } from 'easy-peasy';
//        👆

const todosModel = {
  items: [],
  firstXTodos: computed(state => 
    // 👇
    memo(num => state.items.slice(0, num), 10)
    //                the cache size limit 👆
  )
}
```