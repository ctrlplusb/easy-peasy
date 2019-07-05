# Dispatching actions

To dispatch [actions](/docs/api/action) within your components you can use the [useStoreActions](/docs/api/use-store-actions) hook, providing it a function to map the [actions](/docs/api/action) that your component requires.

```javascript
import { useStoreActions } from 'easy-peasy';

function AddTodo() {
  const addTodo = useStoreActions(actions => actions.todos.addTodo); // 👈
  const [todo, setTodo] = useState('');
  return (
    <>
      <input type="text" value={todo} onChange={e => setTodo(e.target.value)} />
      <button onClick={() => addTodo(todo) /* 👈 dispatching the action */}>
        Add
      </button>
    </>
  );
}
```

## Dispatching actions directly via the store

It is possible to dispatch [actions](/docs/api/action) directly via the [store](/docs/api/store) instance.

```javascript
store.getActions().todos.addTodo('Learn Easy Peasy');
```
