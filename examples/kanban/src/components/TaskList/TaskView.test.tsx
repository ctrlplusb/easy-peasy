import { createStore } from 'easy-peasy';
import { describe, it, expect } from 'vitest';

import model, { StoreModel } from '../../store/model';
import { setup } from '../../utils/test-utils';
import TaskView from './TaskView';

const listKeys: Array<keyof StoreModel> = ['todo', 'doing', 'done'];

describe.each(listKeys)('<TaskView list="%s" task={task} />', (list) => {
  it('should remove the task when clicking the remove button', async () => {
    const store = createPopulatedStore();
    const [firstTask] = store.getState()[list].tasks;

    const { user, getByRole } = setup(<TaskView list={list} task={firstTask} />, {
      store,
    });

    await user.click(
      getByRole('button', { name: new RegExp(`remove "${firstTask.name}"`, 'i') }),
    );

    expect(store.getState()[list].tasks).not.toContain(firstTask);
  });
});

const createPopulatedStore = () => {
  const store = createStore(model);
  for (let i = 0; i < 3; i++) {
    store.getActions().todo.addTask({ id: `todo-${i}`, name: `Todo ${i}` });
    store.getActions().doing.addTask({ id: `doing-${i}`, name: `Doing ${i}` });
    store.getActions().done.addTask({ id: `done-${i}`, name: `Done ${i}` });
  }
  return store;
};
