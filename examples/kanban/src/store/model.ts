import generateId from '../utils/generateId';
import createTaskListStore, { TaskListModel } from './taskList.model';

export interface StoreModel {
  todo: TaskListModel;
  doing: TaskListModel;
  done: TaskListModel;
}

const store: StoreModel = {
  todo: createTaskListStore({
    name: 'Todo',
    tasks: [{ id: generateId(), name: 'Explore easy-peasy' }],
    progressTasksTo: 'doing',
  }),
  doing: createTaskListStore({
    name: 'Doing',
    tasks: [],
    regressTasksTo: 'todo',
    progressTasksTo: 'done',
  }),
  done: createTaskListStore({ name: 'Done', tasks: [], regressTasksTo: 'doing' }),
};

export default store;
