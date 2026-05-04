# useStoreTransition

A [hook](https://reactjs.org/docs/hooks-intro.html) that wraps action dispatches
in [`startTransition`](https://react.dev/reference/react/startTransition),
marking the resulting state updates as non-urgent so they do not block
higher-priority updates such as user input. It also exposes an `isPending` flag
you can use to drive UI feedback while the transition is in flight.

```javascript
const [addTodo, isPending] = useStoreTransition(
  (actions) => actions.todos.add,
);
```

## Arguments

  - `mapActions` (Function, _required_)

    The function that is used to resolve the [action(s)](/docs/api/action.html)
    that your component requires. It receives the following argument:

    - `actions` (Object)

      The [actions](/docs/api/action.html) of your store.

    The selector may return either a single action function or a (possibly
    nested) object of action functions. Function leaves are wrapped to dispatch
    inside `startTransition`. Non-function values are passed through unchanged.

## Returns

A tuple `[wrappedActions, isPending]`:

  - `wrappedActions` mirrors the shape returned by `mapActions`, with every
    function leaf replaced by a wrapper that dispatches the underlying action
    inside `startTransition`. For [thunks](/docs/api/thunk.html), the wrapper
    still returns the underlying promise, so you can `await` it.
  - `isPending` (boolean) is `true` while React is processing the transition,
    `false` otherwise.

## Example: single action

```javascript
import { useStoreState, useStoreTransition } from 'easy-peasy';

function Counter() {
  const count = useStoreState((s) => s.count);
  const [increment, isPending] = useStoreTransition(
    (actions) => actions.increment,
  );
  return (
    <div>
      <span>{count}</span>
      <button disabled={isPending} onClick={() => increment()} type="button">
        {isPending ? 'Working...' : 'Increment'}
      </button>
    </div>
  );
}
```

## Example: object of actions

The hook also accepts a selector that returns a (possibly nested) object of
actions — every function leaf is wrapped recursively.

```javascript
import { useStoreState, useStoreTransition } from 'easy-peasy';

function TodoTools() {
  const items = useStoreState((s) => s.todos.items);
  const [todos, isPending] = useStoreTransition((a) => a.todos);
  return (
    <div>
      <button onClick={() => todos.add('write tests')} type="button">Add</button>
      <button onClick={() => todos.clear()} type="button">Clear</button>
      {isPending && <span>Updating...</span>}
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
    </div>
  );
}
```

## Example: awaiting a wrapped thunk

Wrapped [thunks](/docs/api/thunk.html) still return the original promise, so
the resolved value remains available inside the transition.

```javascript
import { useStoreTransition } from 'easy-peasy';

function FetchButton() {
  const [fetchItem, isPending] = useStoreTransition(
    (actions) => actions.fetchItem,
  );
  return (
    <button
      disabled={isPending}
      onClick={async () => {
        const result = await fetchItem('one');
        console.log(result);
      }}
      type="button"
    >
      {isPending ? 'Fetching...' : 'Fetch'}
    </button>
  );
}
```

## When to use this

Reach for `useStoreTransition` when an action triggers a re-render that is
expensive or non-urgent — for example a thunk that issues several incremental
state updates, or a sort/filter change that affects a large list. Marking the
update as a transition lets React keep the UI responsive (e.g. typing in an
input) while the heavier render is in progress.
