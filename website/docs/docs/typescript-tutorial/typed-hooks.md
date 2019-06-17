# Using typed hooks

For convenience we bind the Easy Peasy's hooks against a [store](/docs/api/store) instance. 

If you were to use the hooks imported directly from the Easy Peasy library, e.g. `import { useStoreActions } from 'easy-peasy';`, you would have to provide the model interface that represents your store every time you used them.

By binding the hooks against a [store](/docs/api/store) instance we provide a convenient mechanism for you to avoid have to do this. 

We recommend that you extract these typed hooks off your [store](/docs/api/store) instance, and export them so that you can easily use them in your components.

```typescript
// my-store.ts

import { createStore } from 'easy-peasy';
import storeModel from './model';

const store = createStore(storeModel);

// 👇export the typed hooks
export const useStoreActions = store.useStoreActions;
export const useStoreDispatch = store.useStoreDispatch;
export const useStoreState = store.useStoreState;

export default store;
```

We can now import the typed hooks into a component.

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