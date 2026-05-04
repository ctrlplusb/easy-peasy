import { createStore } from 'easy-peasy/server';

import { fetchProducts } from '@/lib/data';
import { productsModel } from '@/lib/model';

import { ProductsClient } from './products-client';

export default async function HomePage() {
  const products = await fetchProducts();

  const serverStore = createStore(productsModel, {
    initialState: { items: products, query: '' },
  });
  const { totalValue } = serverStore.getState();

  return (
    <main>
      <h1>Easy Peasy v7 — App Router + RSC</h1>
      <p>
        This server component fetches products, builds a transient store via
        <code> easy-peasy/server</code> to derive a total via the model&apos;s
        computed property, then hands the data to a client component which
        owns the interactive store.
      </p>
      <p>
        <strong>Server-rendered total:</strong>{' '}
        ${totalValue.toFixed(2)}
      </p>
      <ProductsClient initialItems={products} />
    </main>
  );
}
