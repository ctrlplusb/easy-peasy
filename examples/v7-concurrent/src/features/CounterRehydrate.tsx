import { useStoreActions, useStoreRehydrated, useStoreState } from '../store/hooks';

function Counter() {
  useStoreRehydrated();
  const count = useStoreState((state) => state.counter.count);
  const increment = useStoreActions((actions) => actions.counter.increment);
  return (
    <section>
      <h2>1. Suspense rehydration</h2>
      <p>
        <code>useStoreRehydrated</code> suspends until the persisted counter
        loads. Reload the page after incrementing — the value persists.
      </p>
      <p>
        Count: <strong>{count}</strong>
      </p>
      <button onClick={() => increment()} type="button">
        Increment
      </button>
    </section>
  );
}

export default Counter;
