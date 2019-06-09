# Accessing state

We leverage React [hooks](https://reactjs.org/docs/hooks-intro.html) to
communicate with the store. If you aren't familiar with hooks, we highly
recommend you read the [official documentation](https://reactjs.org/docs/hooks-intro.html)
on them.

To access state within your components you can use the `useStoreState` hook,
providing it a function to map your state.

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

In the case that your `useStoreState` implementation uses a prop to map the
required state, you need to declare the prop within the "dependencies" argument
of the `useStoreState` hook.

This is a similar requirement to some of the official React hooks, and something
that you may already be familiar with.

The `useStoreState` hook will track dependenices and ensure that the state is
remapped any time that they change.

```javascript
import { useStoreState } from 'easy-peasy';

const Product = ({ id }) => {
  const product = useStoreState(
    state => state.products[id],
    [id] // 👈 declare the prop as a dependency
  );
  return <div>{product.title}</div>);
};
```

## Tips, Tricks and Warnings

You should keep your state mappers very simple - don't perform operations against
your state within them. This is really important as the `useStoreState` hook
runs a performance optimisation where it checks to see if the mapped state has
changed at all, and will only rerender your component if it has changed.

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

Note how an array is being returned within the state mapper. A new array will
be returned every time the state mapper is executed, so the `useStoreState`
will be forced to rerender your application every time _any_ state update occurs
on your store.

We recommend that you use multiple instances of the `useStoreState` hook to
access items.

```javascript
function Fixed() {
  const thing1 = useStoreState(state => state.thing1);
  const thing2 = useStoreState(state => state.thing2);
  return <div>I am optimised</div>;
}
```

What if you need to perform an operation against your state? For example, perhaps
you want to derive the total price of all the products available within your
state. To support this case we provide the ability to define a [selector](#todo),
which is covered later in the tutorial.

## Accessing state directly via the store

It is also possible to access the state directly off of the store. You can
use the `getState` function attached to a store in order to do so.

```javascript
store.getState().todos.items;
```