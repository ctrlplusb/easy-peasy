import { ChangeEvent } from 'react';

import {
  useStoreActions,
  useStoreDeferredState,
  useStoreState,
  useStoreTransition,
} from '../store/hooks';

function CatalogSearch() {
  const query = useStoreState((state) => state.catalog.query);
  const setQuery = useStoreActions((actions) => actions.catalog.setQuery);
  const itemCount = useStoreState((state) => state.catalog.items.length);

  const [loadItems, isLoading] = useStoreTransition(
    (actions) => actions.catalog.loadItems,
  );

  const matches = useStoreDeferredState((state) => {
    const q = state.catalog.query.toLowerCase();
    if (!q) return state.catalog.items.slice(0, 50);
    return state.catalog.items
      .filter((item) => item.name.toLowerCase().includes(q))
      .slice(0, 50);
  });

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
  }

  return (
    <section>
      <h2>2. useStoreTransition + useStoreDeferredState</h2>
      <p>
        <button disabled={isLoading} onClick={() => loadItems(20000)} type="button">
          {isLoading ? 'Loading 20,000 items…' : 'Load 20,000 items'}
        </button>{' '}
        ({itemCount} loaded)
      </p>
      <p>
        Filter (deferred so typing stays responsive):{' '}
        <input
          onChange={handleQueryChange}
          placeholder="Type to filter…"
          type="text"
          value={query}
        />
      </p>
      <ul>
        {matches.map((item) => (
          <li key={item.id}>
            {item.name} <em>({item.category})</em>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default CatalogSearch;
