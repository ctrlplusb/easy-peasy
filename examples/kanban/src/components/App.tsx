import TaskList from './TaskList';

const App = () => {
  return (
    <div>
      <div className="flex flex-wrap justify-between mb-8">
        <TaskList list="todo" />
        <TaskList list="doing" />
        <TaskList list="done" />
      </div>

      <p className="w-full italic font-medium text-center text-slate-400">
        Data is persisted in the `sessionStorage`.
      </p>
    </div>
  );
};

export default App;
