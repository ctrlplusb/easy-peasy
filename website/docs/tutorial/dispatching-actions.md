# Dispatching actions

To dispatch actions within your components you can use the `useStoreActions`
hook, providing it a function to map the actions that your component requires.

```javascript
import { useStoreActions } from 'easy-peasy';

const IncrementCountButton = () => {
  const increment = useStoreActions(actions => actions.counter.increment);
  return (<button onClick={() => increment()}>Add 1 more</button>);
};
```

When dispatching actions you can provide a payload, which will passed to the
action handler that was defined on your model.

```javascript
const addTodo = useStoreActions(actions => actions.todos.add);

addTodo('Learn Easy Peasy');
```

## Dispatching actions directly via the store

Easy Peasy binds your actions against a property called `actions` on your store,
allowing you to dispatch actions directly via the store instance.

```javascript
store.actions.todos.addTodo('Learn Easy Peasy');
```

## Actions are synchronous

Actions are executed synchronously, therefore, you can immediately query your
store to see the updated state.

```javascript
store.actions.todos.addTodo('Learn Easy Peasy');

store.getState().todos.items;
// ["Learn Easy Peasy"]
```