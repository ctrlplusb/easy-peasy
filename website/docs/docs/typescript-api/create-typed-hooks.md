# createTypedHooks

Creates typed versions of the hooks so that you don't need to apply typing information against them when using them within your components.

## Example

```typescript
// hooks.js
import { createTypedHooks } from 'easy-peasy';
import { StoreModel } from './model';

const { useStoreActions, useStoreState, useStoreDispatch } = createTypedHooks<StoreModel>();

export default {
  useStoreActions,
  useStoreState,
  useStoreDispatch
}
```

And then use them within your components:

```typescript
import { useStoreState } from './hooks';  // 👈 import the typed hooks

export default MyComponent() {
  //                          This will be typed
  //                                       👇
  const message = useStoreState(state => state.message);
  return <div>{message}</div>;
}
```