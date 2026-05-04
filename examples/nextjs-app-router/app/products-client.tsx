'use client';

import { useRef } from 'react';
import { Store, StoreProvider, createStore } from 'easy-peasy';

import { productsModel } from '@/lib/model';
import type { Product, ProductsModel } from '@/lib/model';

import { ProductsView } from './products-view';

export function ProductsClient({ initialItems }: { initialItems: Product[] }) {
  const storeRef = useRef<Store<ProductsModel> | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createStore(productsModel, {
      initialState: { items: initialItems, query: '' },
    });
  }
  return (
    <StoreProvider store={storeRef.current}>
      <ProductsView />
    </StoreProvider>
  );
}
