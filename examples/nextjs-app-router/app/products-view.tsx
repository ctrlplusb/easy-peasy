'use client';

import { ChangeEvent } from 'react';

import { useStoreActions, useStoreState } from '@/lib/hooks';

export function ProductsView() {
  const query = useStoreState((state) => state.query);
  const filtered = useStoreState((state) => state.filtered);
  const total = useStoreState((state) => state.totalValue);
  const setQuery = useStoreActions((actions) => actions.setQuery);

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
  }

  return (
    <section>
      <p>
        <strong>Client total:</strong> ${total.toFixed(2)}
      </p>
      <p>
        <input
          onChange={handleQueryChange}
          placeholder="Filter by name…"
          type="text"
          value={query}
        />
      </p>
      <ul>
        {filtered.map((product) => (
          <li key={product.id}>
            {product.name} — {product.category} — ${product.price.toFixed(2)}
          </li>
        ))}
      </ul>
    </section>
  );
}
