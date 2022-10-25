import { useStoreState, useStoreActions } from '../../store';
import { StoreModel } from '../../store/model';
import { Task } from '../../store/taskList.model';

const TaskView: React.FC<{ task: Task; list: keyof StoreModel }> = ({ task, list }) => {
  const { canRegressTasks, canProgressTasks } = useStoreState((state) => state[list]);
  const { regressTask, progressTask, removeTask } = useStoreActions(
    (actions) => actions[list],
  );
  return (
    <div className="relative p-4 py-2 rounded-md bg-white border border-slate-200 shadow-sm">
      {task.name}

      <div className="flex">
        {canRegressTasks && (
          <button
            className="mr-auto"
            aria-label={`Regress "${task.name}"`}
            onClick={() => regressTask(task)}
          >
            ⏮️
          </button>
        )}
        <button
          className="text-xs"
          aria-label={`Remove "${task.name}"`}
          onClick={() => removeTask(task)}
        >
          ❌
        </button>
        {canProgressTasks && (
          <button
            className="ml-auto"
            aria-label={`Progress "${task.name}"`}
            onClick={() => progressTask(task)}
          >
            ⏭️
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskView;
