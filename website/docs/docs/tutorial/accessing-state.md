# Accessing state

We leverage React [hooks](https://reactjs.org/docs/hooks-intro.html) to communicate with the store. If you aren't familiar with hooks, we highly recommend you read the [official documentation](https://reactjs.org/docs/hooks-intro.html)
on them.

To access state within your components you can use the [useStoreState](/docs/api/use-store-state) hook, providing it a function to map your state.

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

In the case that your [useStoreState](/docs/api/use-store-state) implementation uses a prop to map the required state, you need to declare the prop within the "dependencies" argument of the [useStoreState](/docs/api/use-store-state) hook. This is a similar requirement to some of the official React hooks, and something that you may already be familiar with.

The [useStoreState](/docs/api/use-store-state) hook will track dependencies and ensure that the state is remapped any time that they change.

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

## Accessing state directly via the store

It is possible to access the state directly from the [store](/docs/api/store) instance.

```javascript
store.getState().todos.items;
```