# useStoreActions

A [hook](https://reactjs.org/docs/hooks-intro.html) granting your components access to the [store's](/docs/api/store) [actions](/docs/api/action.html).

```javascript
const addTodo = useStoreActions(actions => actions.todos.add);
```

## Arguments

  - `mapActions` (Function, required)

    The function that is used to resolved the [action](/docs/api/action.html) that your component requires. It receives the following arguments:

    - `actions` (Object, required)

      The [actions](/docs/api/action.html) of your store.

## Example

```javascript
import { useState } from 'react';
import { useStoreActions } from 'easy-peasy';

const AddTodo = () => {
  const [text, setText] = useState('');
  const addTodo = useStoreActions(actions => actions.todos.add);
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => addTodo(text)}>Add</button>
    </div>
  );
};
```
