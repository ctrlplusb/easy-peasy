import { createTypedHooks, useStoreRehydrated } from 'easy-peasy';

import type { StoreModel } from './model';

export const {
  useStoreActions,
  useStoreDispatch,
  useStoreState,
  useStore,
  useStoreTransition,
  useStoreDeferredState,
  useStoreOptimistic,
} = createTypedHooks<StoreModel>();

export { useStoreRehydrated };
