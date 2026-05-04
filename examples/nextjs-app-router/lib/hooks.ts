import { createTypedHooks } from 'easy-peasy';

import type { ProductsModel } from './model';

export const {
  useStoreActions,
  useStoreState,
} = createTypedHooks<ProductsModel>();
