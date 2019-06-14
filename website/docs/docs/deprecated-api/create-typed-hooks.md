# createTypedHooks

Allows you to create typed versions of all the hooks so that you don't need to constantly apply typing information against them.

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

And then use your typed hooks in your components:

```typescript
import { useStoreState } from './hooks';

export default MyComponent() {
  //                          This will be typed
  //                                       👇
  const message = useStoreState(state => state.message);
  return <div>{message}</div>;
}
```