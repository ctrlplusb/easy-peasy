# useStoreDispatch

A [hook](https://reactjs.org/docs/hooks-intro.html) granting your components access to the [store's](/docs/api/store) dispatch.

```javascript
const dispatch = useStoreDispatch();
```

## Example

```javascript
import { useState } from 'react';
import { useStoreDispatch } from 'easy-peasy';

const AddTodo = () => {
  const [text, setText] = useState('');
  const dispatch = useStoreDispatch();
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => dispatch({ type: 'ADD_TODO', payload: text })}>Add</button>
    </div>
  );
};
```