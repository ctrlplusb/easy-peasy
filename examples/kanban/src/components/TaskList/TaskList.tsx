import { useStoreState } from '../../store';
import { StoreModel } from '../../store/model';
import AddTask from './AddTask';
import TaskView from './TaskView';

const TaskList: React.FC<{ list: keyof StoreModel }> = ({ list }) => {
  const state = useStoreState((state) => state[list]);

  return (
    <div className="p-4 md:w-1/3">
      <h1 id={`${list}-heading`} className="font-bold">
        {state.name}
      </h1>
      <div className="flex flex-col h-full py-4 p-2 rounded-md shadow-md bg-slate-50 ">
        <ul aria-labelledby={`${list}-heading`} className="space-y-4">
          {state.tasks.map((task) => (
            <TaskView key={task.id} list={list} task={task} />
          ))}
        </ul>
        <div className="mt-auto">
          <AddTask list={list} />
        </div>
      </div>
    </div>
  );
};

export default TaskList;
