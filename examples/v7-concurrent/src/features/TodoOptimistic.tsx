import { startTransition, useState } from 'react';

import { useStoreActions, useStoreOptimistic } from '../store/hooks';

import type { Todo } from '../store/model';

function TodoOptimistic() {
  const [draft, setDraft] = useState('');
  const addItemAsync = useStoreActions((actions) => actions.todos.addItemAsync);

  const [items, addOptimistic] = useStoreOptimistic<Todo[], Todo>(
    (state) => state.todos.items,
    (current, pending) => [...current, pending],
  );

  function handleSubmit() {
    if (!draft.trim()) return;
    const text = draft;
    setDraft('');
    startTransition(async () => {
      addOptimistic({ id: `optimistic-${Date.now()}`, text });
      await addItemAsync({ text });
    });
  }

  return (
    <section>
      <h2>3. useStoreOptimistic</h2>
      <p>
        New todos appear immediately; the underlying thunk simulates a 1.2s
        network round-trip. The optimistic entry is replaced when the real
        action commits.
      </p>
      <p>
        <input
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSubmit();
          }}
          placeholder="What needs doing?"
          type="text"
          value={draft}
        />{' '}
        <button onClick={handleSubmit} type="button">
          Add
        </button>
      </p>
      <ul>
        {items.map((todo) => (
          <li key={todo.id}>
            {todo.id.startsWith('optimistic-') ? <em>{todo.text}…</em> : todo.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default TodoOptimistic;
