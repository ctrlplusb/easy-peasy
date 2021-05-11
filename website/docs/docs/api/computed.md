# computed

Allows you to define a computed property against your model. A computed property
is state that is derived from other state. They can be accessed by your
components just like any other state.

```javascript
const model = {
  user: null,
  isLoggedIn: computed((state) => state.user != null),
};
```

The computation process is only performed when the property is being consumed by
a component. In addition to this the results of
[computed](/docs/api/computed.html) properties are cached, with re-computations
only occurring when the state that they rely on changes.

- [API](#api)
  - [Arguments](#arguments)
- [Tutorial](#tutorial)
  - [Consuming a component property](#consuming-a-component-property)
  - [Utilising state resolvers](#utilising-state-resolvers)
  - [Supporting runtime arguments](#supporting-runtime-arguments)
- [Limitations and Known Issues](#limitations-and-known-issues)
  - [Computed properties are not accessible within actions](#computed-properties-are-not-accessible-within-actions)
  - [Computed properties break when destructuring a computed property out of state](#computed-properties-break-when-destructuring-a-computed-property-out-of-state)
  - [TypeScript: Defining a computed property as optional](#typescript-defining-a-computed-property-as-optional)

## API

The `computed` function is described below.

### Arguments

The `computed` helper allows you to provide two forms of arguments;

1. **A compute function only;**

   ```javascript
   computed(computeFn);
   ```

_or_

2. **A state resolver function, and a compute function;**

   ```javascript
   computed(stateResolverFn, computeFn);
   ```

The arguments as seen in the examples above can be described as follows;

- `computeFn` (Function, _required_)

  The function that will receive the input state and return the derived value.

  If no `stateResolverFm` was provided the `computeFn` will receive the local
  model state as its input.

- `stateResolvers` (Array\<Function\>)

  State resolvers allow you to isolate the specific parts of your state as
  inputs to your computation function. They also have the added benefit of being
  able to expose the entire store state to your computed property. Each state
  resolver function receives the following arguments:

  - `state` (Object)

    The local state against which your [computed](/docs/api/computed.html)
    property is bound.

  - `storeState` (Object)

    The entire store state

  In general it is recommended that you only use state resolvers if you need to
  resolve state from another part of your model. There are some performance
  benefits to be had by isolating local state, but in almost every case this
  would be insignificant.

  It is also worth noting that the `state` and `storeState` that are provided to
  your state resolvers will include [computed](/docs/api/computed.html)
  properties too. Computed properties are allowed to reference each other.

## Tutorial

### Consuming a component property

You access computed properties in the same manner as any other state within your
components, i.e. via the [useStoreState](/docs/api/use-store-state.html) hook.
Any updates to our [computed](/docs/api/computed.html) property, i.e. the input
state to our [computed](/docs/api/computed.html) property changed, will
automatically re-render your component.

```javascript
import { useStoreState } from 'easy-peasy';

function TotalPriceOfProducts() {
  const totalPrice = useStoreState((state) => state.products.totalPrice);
  return <div>Total: {totalPrice}</div>;
}
```

### Utilising state resolvers

In this example we will use state resolvers to isolate different parts of our
store state.

```javascript
const model = {
  products: {
    items: {
      1: { id: 1, name: 'boots', price: 20 },
    },
  },
  basket: {
    productIds: [1],
    productsInBasket: computed(
      [
        (state) => state.productIds,
        //          👇 the store state is the 2nd argument to a state resolver
        (state, storeState) => storeState.products.items,
      ],
      (productIds, products) => productIds.map((id) => products[id]),
    ),
  },
};
```

### Supporting runtime arguments

Computed properties do not natively support runtime arguments, however, you can
achieve this by resolving a function from your computed property.

```javascript
const todos = {
  items: [{ id: 1, text: 'answer questions' }],

  todoById: computed((state) => {
    // Note how we are returning a function instead of state
    //      👇
    return (id) => state.items.find((todo) => todo.id === id);
  }),
};
```

You can then use the function within your components.

```javascript
function Todo({ id }) {
  //                                                         👇
  const todo = useStoreState((state) => state.todos.todoById(id));
  return todo ? <div>{todo.text}</div> : null;
}
```

Note that only the function that you return will be memoized. If you wish to
memoize the results from the function itself you will need to utilize a
memoization utility, such as
[`memoizerific`](https://github.com/caiogondim/fast-memoize.js).

```javascript
import memoize from 'memoizerific';

const memoizedFind = memoize((state, id) => state.items.find((todo) => todo.id === id), 1)

const todos = {
  items: [{ id: 1, text: 'answer questions' }],

  todoById: computed((state) => {
    // Wrap the returned function with the memoize utility
    //        👇
    return (id) => memoizedFind(state, id);
  }),
};
```

We don't recommend adding memoization unless you are observing performance
issues.

## Limitations and Known Issues

### Computed properties are not accessible within actions

This design decision was made so that we can guarantee the lazy resolution of
computed properties, ensuring that they are only computed when they are being
accessed by your components.

```javascript
import { action, computed } from 'easy-peasy';

const model = {
  todos: [],
  todoCount: computed(state => state.todos.length),
  addTodo: action((state, payload) => {
    // Invalid! todoCount will be undefined
    //           👇
    if (state.todoCount) < 10) {
      state.todos.push(payload);
    }
  }),
}
```

> They are available within every other API that utilizes/exposes state

### Computed properties break when destructuring a computed property out of state

Say you had a computed property defined in your model like below.

```javascript
const storeModel = {
  session: {
    user: null,
    isLoggedIn: computed((state) => state.user != null),
  },
};
```

If you destructure the computed property when accessing it in your component,
like below, it will not work.

```javascript
function LoggedInBadge() {
  const { isLoggedIn } = useStoreState((state) => state.session);
  return isLoggedIn ? <LoggedInSvg /> : <LoggedOutSvg />;
}
```

This is because computed properties are in actual fact
[getter properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get).
If you destructure the property you break the getter mechanism. Therefore you
may not receive updates to your computed property based on when the state that
your computed property depends on updates.

The resolution to this is to instead resolve the computed property directly.

```javascript
function LoggedInBadge() {
  const isLoggedIn = useStoreState((state) => state.session.isLoggedIn);
  return isLoggedIn ? <LoggedInSvg /> : <LoggedOutSvg />;
}
```

### TypeScript: Defining a computed property as optional

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
