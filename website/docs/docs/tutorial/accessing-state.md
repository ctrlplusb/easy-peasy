# Accessing state

We leverage React [hooks](https://reactjs.org/docs/hooks-intro.html) to communicate with the store. If you aren't familiar with hooks, we highly recommend you read the [official documentation](https://reactjs.org/docs/hooks-intro.html)
on them.

To access state within your components you can use the [useStoreState](/api/use-store-state) hook, providing it a function to map your state.

```javascript
import { useStoreState } from 'easy-peasy';

function TodoList() {
  const todos = useStoreState(state => state.todos.items);
  return (
    <div>
      {todos.map(todo =>
        <div key={todo.id}>{todo.text}</div>
      )}
    </div>
  );
}
```

## Using props to map state

In the case that your [useStoreState](/api/use-store-state) implementation uses a prop to map the required state, you need to declare the prop within the "dependencies" argument of the [useStoreState](/api/use-store-state) hook. This is a similar requirement to some of the official React hooks, and something that you may already be familiar with.

The [useStoreState](/api/use-store-state) hook will track dependenices and ensure that the state is remapped any time that they change.

```javascript
import { useStoreState } from 'easy-peasy';

const Product = ({ id }) => {
  const product = useStoreState(
    state => state.products[id],
    [id]
  );
  return <div>{product.title}</div>);
};
```

## Pitfalls

Keep your state mappers very simple - don't perform operations against your state within them. This is important as the [useStoreState](/api/use-store-state) hook runs a performance optimisation where it checks to see if the mapped state has changed at all. It uses strict equality checking to check if the next mapped state is equal to the previously mapped state (`prevMappedState === nextMappedState`) - if it isn't then we will rerender your component.

Therefore if you perform an operation within your map state that always produces a new value (e.g. a new array/object) your component will rerender for _any_ state change.

Let's illustrate this pitfall via the following example.

```javascript
function AntiPattern() {
  const stuff = useStoreState(state => {
    return [state.thing1, state.thing2];
  });
  return (
    <div>
      I will rerender any time any state update happens across the store!
    </div>
  );
}
```

Note how an array is being returned within the state mapper. A new array will be returned every time the state mapper is executed. This breaks strict equality checking, forcing your component to rerender for _any_ state change on your [store](/api/store).

We recommend two alternative approaches to avoid this.

**1. Resolve slices of state individually**

```javascript
function Fixed() {
  const thing1 = useStoreState(state => state.thing1);
  const thing2 = useStoreState(state => state.thing2);
  return <div>I am optimised</div>;
}
```

**2. Define a [selector](/api/selector) for derived state**

For example, perhaps you want to map an array of products to an array containing only their names. 

```javascript
const store = createStore({
  products: [],
  productNames: selector(
    [state => state.products],
    ([products]) => products.map(product => product.name)
  )
});

const productNames = useStoreState(state => state.productNames());
```

We cover [selectors](/api/selector) in more detail later in the tutorial.

## Accessing state directly via the store

It is possible to access the state directly from the [store](/api/store) instance.

```javascript
store.getState().todos.items;
```