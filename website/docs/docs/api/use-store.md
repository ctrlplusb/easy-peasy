# useStore

A [hook](https://reactjs.org/docs/hooks-intro.html) granting your components access to the [store](/docs/api/store.html) instance.

> This should only be used for advanced or exceptional cases, for e.g. when you would like to dynamically extend the store deep within your component tree.

```javascript
const store = useStore();
```

## Example

```javascript
import { useStore } from 'easy-peasy';

const AddTodo = () => {
  const store = useStore();
  return (
    <div>
      {store.getState().sayHello}
    </div>
  );
};
```