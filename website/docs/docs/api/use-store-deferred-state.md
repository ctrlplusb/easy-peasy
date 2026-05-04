# useStoreDeferredState

A [hook](https://reactjs.org/docs/hooks-intro.html) that combines
[`useStoreState`](/docs/api/use-store-state.html) with React's
[`useDeferredValue`](https://react.dev/reference/react/useDeferredValue),
allowing React to keep returning the previous selected value while a fresh
value is being computed for an expensive selector. The fresh value is
delivered in a subsequent render once the work has caught up.

```javascript
const results = useStoreDeferredState((state) => expensiveSelect(state));
```

## Arguments

The signature mirrors [`useStoreState`](/docs/api/use-store-state.html):

  - `mapState` (Function, _required_)

    The function that is used to resolve the piece of state that your component
    requires. It receives the following argument:

    - `state` (Object)

      The state of your store.

  - `equalityFn` (Function, _optional_)

    Allows you to provide custom logic for determining whether the mapped state
    has changed. See [`useStoreState`](/docs/api/use-store-state.html) for a
    full description.

## Returns

The deferred selected state. During urgent updates this may be the previous
value; React will return the latest value in a follow-up render once it has
caught up.

## Example

```javascript
import { useState } from 'react';
import { useStoreDeferredState } from 'easy-peasy';

function ProductSearch() {
  const [query, setQuery] = useState('');
  const matches = useStoreDeferredState((state) =>
    state.products.items.filter((p) => p.name.includes(query)),
  );
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>{matches.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
    </div>
  );
}
```

In this example, typing in the input triggers a fast re-render with the
previous list of `matches` while React computes the fresh, filtered list in
the background. The fresh list arrives in a subsequent render — keystrokes
stay snappy even when the underlying list is large.

## When to use this

Reach for `useStoreDeferredState` when:

  - the selector is expensive (large list mapping/filtering, derivations that
    can't reasonably be moved into [`computed`](/docs/api/computed.html)), and
  - it's acceptable for the UI to briefly show a stale value while React
    catches up.

If your selector is cheap, prefer the regular
[`useStoreState`](/docs/api/use-store-state.html).
