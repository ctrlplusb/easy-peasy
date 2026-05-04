import { Suspense } from 'react';

import CatalogSearch from './features/CatalogSearch';
import Counter from './features/CounterRehydrate';
import TodoOptimistic from './features/TodoOptimistic';

function App() {
  return (
    <main style={{ fontFamily: 'system-ui', maxWidth: 720, margin: '2rem auto' }}>
      <h1>Easy Peasy v7 — Concurrent React</h1>
      <p>Each section demos one of the new v7 hooks.</p>
      <Suspense fallback={<p>Rehydrating persisted counter…</p>}>
        <Counter />
      </Suspense>
      <hr />
      <CatalogSearch />
      <hr />
      <TodoOptimistic />
    </main>
  );
}

export default App;
