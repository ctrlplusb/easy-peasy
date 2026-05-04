import { createTypedHooks } from 'easy-peasy';

import type { StoreModel } from './model';

export const {
  useStoreActions,
  useStoreDispatch,
  useStoreState,
  useStore,
  useStoreRehydrated,
  useStoreTransition,
  useStoreDeferredState,
  useStoreOptimistic,
} = createTypedHooks<StoreModel>();
