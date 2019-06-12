# Dispatching actions

To dispatch [actions](/api/action) within your components you can use the [useStoreActions](/api/use-store-actions) hook, providing it a function to map the [actions](/api/action) that your component requires.

```javascript
import { useStoreActions } from 'easy-peasy';

const IncrementCountButton = () => {
  const increment = useStoreActions(actions => actions.counter.increment);
  return (<button onClick={() => increment()}>Add 1 more</button>);
};
```

When dispatching [actions](/api/action) you can provide a payload, which will passed to the [actions](/api/action) handler that was defined on your model.

```javascript
const addTodo = useStoreActions(actions => actions.todos.add);

addTodo('Learn Easy Peasy');
```

## Dispatching actions directly via the store

It is possible to dispatch [actions](/api/action) directly via the [store](/api/store) instance.

```javascript
store.getActions().todos.addTodo('Learn Easy Peasy');
```

## Actions are synchronous

[Actions](/api/action) are executed synchronously, therefore, you can immediately query your [store](/api/store) to see the updated state.

```javascript
store.getActions().todos.addTodo('Learn Easy Peasy');

store.getState().todos.items;
// ["Learn Easy Peasy"]
```

## Debugging Actions

Ensure you have the [Redux Dev Tools](https://github.com/zalmoxisus/redux-devtools-extension) extension installed. This will allow you to see your dispatched actions, with their payload and the effect that they had on your state.

<img src="../../assets/devtools-action.png" />