# useStoreActions

A [hook](https://reactjs.org/docs/hooks-intro.html) granting your components
access to the store's actions.

```javascript
const addTodo = useStoreActions(actions => actions.todos.add);
```

## Arguments

  - `mapActions` (Function, required)

    The function that is used to resolved the action(s) that your component requires. Your `mapActions` can either resolve single or multiple actions. The function will receive the following arguments:

    - `actions` (Object, required)

      The `actions` of your store.

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
