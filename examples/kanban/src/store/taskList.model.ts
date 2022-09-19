import {
  action,
  Action,
  Actions,
  computed,
  Computed,
  Store,
  thunk,
  Thunk,
} from 'easy-peasy';
import { StoreModel } from './model';

export interface Task {
  id: string;
  name: string;
}

interface TaskListModelState {
  name: string;
  tasks: Task[];

  regressTasksTo?: keyof StoreModel;
  progressTasksTo?: keyof StoreModel;
}

export interface TaskListModel extends TaskListModelState {
  canRegressTasks: Computed<this, boolean>;
  canProgressTasks: Computed<this, boolean>;

  addTask: Action<this, Task>;
  removeTask: Action<this, Task>;

  regressTask: Thunk<this, Task, void, StoreModel>;
  progressTask: Thunk<this, Task, void, StoreModel>;
}

const createTaskListStore = (initialState: TaskListModelState): TaskListModel => ({
  ...initialState,

  canRegressTasks: computed((state) => !!state.regressTasksTo),
  canProgressTasks: computed((state) => !!state.progressTasksTo),

  addTask: action((state, task) => {
    state.tasks.push(task);
  }),
  removeTask: action((state, task) => {
    state.tasks = state.tasks.filter((t) => t.id !== task.id);
  }),

  regressTask: moveTask(initialState.regressTasksTo!),
  progressTask: moveTask(initialState.progressTasksTo!),
});

const moveTask = (to: keyof StoreModel) =>
  thunk<TaskListModel, Task, void, StoreModel>((actions, task, { getStoreActions }) => {
    const storeActions = getStoreActions();

    actions.removeTask(task);
    storeActions[to].addTask(task);
  });

export default createTaskListStore;
