# Using typed hooks

For convenience we bind the hooks to your create [store](/docs/api/store) instances. This is especially useful in the context of Typescript because all the typing information of your model will be automatically baked into these hooks. We therefore recommend that you export these hooks of your store so that you can easily import and use them within your components.

```typescript
// my-store.ts

import { createStore } from 'easy-peasy';
import model from './model';

const store = createStore(model);

// 👇export the typed hooks
export const useStoreActions = store.useStoreActions;
export const useStoreDispatch = store.useStoreDispatch;
export const useStoreState = store.useStoreState;

export default store;
```

You could then import them into your components, and receive the benefit of all the model typing being available.

```typescript
import { useStoreState } from './my-store'; // 👈 import the typed hook

function TodoList() {
  const todos = useStoreState(state => state.todos.items);
  return (
    <ul>
      {todos.map(todo => <li>{todo}</li>)}
    </ul>
  );
}
```

***TODO: Screenshot of typing info via hooks***