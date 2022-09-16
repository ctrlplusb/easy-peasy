import { useState } from 'react';
import { useStoreState, useStoreActions } from './store';

const App = () => {
  const { remainingTodos, completedTodos } = useStoreState((state) => state);
  const { toggleTodo } = useStoreActions((actions) => actions);

  return (
    <div>
      <h1>Todo list</h1>
      <ul>
        {remainingTodos.map((todo, idx) => (
          <li key={idx}>
            <input type="checkbox" onChange={() => toggleTodo(todo)} />
            {todo.text}
          </li>
        ))}
        {completedTodos.map((todo, idx) => (
          <li key={idx}>
            <input type="checkbox" checked onChange={() => toggleTodo(todo)} />
            <s>{todo.text}</s>
          </li>
        ))}
      </ul>

      <AddTodo />
    </div>
  );
};

const AddTodo = () => {
  const [todoText, setTodoText] = useState('');
  const { addTodo } = useStoreActions((actions) => actions);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        addTodo({ text: todoText, done: false });
        setTodoText('');
      }}
    >
      <input type="text" value={todoText} onChange={(e) => setTodoText(e.target.value)} />
      <button type="submit" disabled={!todoText.length}>
        Add todo
      </button>
    </form>
  );
};

export default App;
