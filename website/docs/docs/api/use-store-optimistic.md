# useStoreOptimistic

A [hook](https://reactjs.org/docs/hooks-intro.html) that combines
[`useStoreState`](/docs/api/use-store-state.html) with React's
[`useOptimistic`](https://react.dev/reference/react/useOptimistic), allowing
components to render an optimistic value while a pending action is in flight.
Once the underlying store state changes (typically when the action commits),
the optimistic value is discarded and the real value is shown.

```javascript
const [items, addOptimistic] = useStoreOptimistic(
  (state) => state.todos.items,
  (current, pending) => [...current, pending],
);
```

## Arguments

  - `mapState` (Function, _required_)

    The function that is used to resolve the piece of state that should be
    shown optimistically. It receives the following argument:

    - `state` (Object)

      The state of your store.

  - `updateFn` (Function, _required_)

    A reducer that produces the optimistic value from the current state and a
    pending value. It receives the following arguments:

    - `current` (any)

      The current selected state — either the most recent value from the
      store, or the most recent optimistic value if one is in flight.

    - `pending` (any)

      The optimistic value that was passed to the dispatch function (the
      second tuple member returned by the hook).

## Returns

A tuple `[optimisticState, addOptimistic]`:

  - `optimisticState` is the result of the most recent `updateFn` call while a
    transition is pending, otherwise the real value from the store.
  - `addOptimistic(pending)` schedules an optimistic update. It must be called
    inside a transition (e.g. from within
    [`startTransition`](https://react.dev/reference/react/startTransition) or
    a [form action](https://react.dev/reference/react-dom/components/form)).
    The optimistic value is shown until the underlying store state next
    changes, at which point it resets to reflect the real store value.

## Example

```javascript
import { startTransition } from 'react';
import {
  useStoreActions,
  useStoreOptimistic,
} from 'easy-peasy';

function TodoList() {
  const [items, addOptimistic] = useStoreOptimistic(
    (state) => state.todos.items,
    (current, pending) => [...current, { ...pending, pending: true }],
  );
  const addItemAsync = useStoreActions((a) => a.todos.addItemAsync);

  return (
    <div>
      <ul>
        {items.map((item) => (
          <li key={item.id} style={{ opacity: item.pending ? 0.5 : 1 }}>
            {item.text}
          </li>
        ))}
      </ul>
      <button
        onClick={() => {
          startTransition(async () => {
            const draft = { id: crypto.randomUUID(), text: 'New todo' };
            addOptimistic(draft);
            await addItemAsync(draft);
          });
        }}
        type="button"
      >
        Add Todo
      </button>
    </div>
  );
}
```

In this example the new todo appears in the list immediately at half opacity
while `addItemAsync` is in flight. When the underlying state updates with the
real item, the optimistic value resets and the committed item is shown at full
opacity.

## When to use this

Reach for `useStoreOptimistic` when an asynchronous [thunk](/docs/api/thunk.html)
will eventually update the store and you want to give the user immediate
feedback before the action commits — for example, message sends, list inserts,
toggles, or any "fire-and-display" interaction. Pair it with
[`useStoreTransition`](/docs/api/use-store-transition.html) or `startTransition`
to keep the UI responsive.

> **Note:** because the optimistic value is reset when the underlying selected
> state changes, choose your selector carefully — selecting the smallest piece
> of state that the optimistic update affects gives the cleanest behaviour.
