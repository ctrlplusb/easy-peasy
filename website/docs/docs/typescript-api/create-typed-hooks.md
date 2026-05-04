# createTypedHooks

Creates typed versions of the hooks so that you don't need to apply typing information against them when using them within your components.

The returned object includes typed versions of every public Easy Peasy hook:

- [`useStoreActions`](/docs/api/use-store-actions.html)
- [`useStoreDispatch`](/docs/api/use-store-dispatch.html)
- [`useStoreState`](/docs/api/use-store-state.html)
- [`useStoreRehydrated`](/docs/api/use-store-rehydrated.html)
- [`useStoreTransition`](/docs/api/use-store-transition.html)
- [`useStoreDeferredState`](/docs/api/use-store-deferred-state.html)
- [`useStoreOptimistic`](/docs/api/use-store-optimistic.html)
- [`useStore`](/docs/api/use-store.html)

## Example

```typescript
// hooks.js
import { createTypedHooks } from 'easy-peasy';
import { StoreModel } from './model';

const {
  useStoreActions,
  useStoreState,
  useStoreDispatch,
  useStore,
  useStoreTransition,
  useStoreDeferredState,
  useStoreOptimistic,
  useStoreRehydrated,
} = createTypedHooks<StoreModel>();

export {
  useStoreActions,
  useStoreState,
  useStoreDispatch,
  useStore,
  useStoreTransition,
  useStoreDeferredState,
  useStoreOptimistic,
  useStoreRehydrated,
};
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
