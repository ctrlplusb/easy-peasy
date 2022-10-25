import { createStore } from 'easy-peasy';
import { describe, it, expect } from 'vitest';

import model, { StoreModel } from '../../store/model';
import { setup } from '../../utils/test-utils';
import AddTask from './AddTask';

const listKeys: Array<keyof StoreModel> = ['todo', 'doing', 'done'];

describe.each(listKeys)('<AddTask list="%s" />', (list) => {
  it('should add tasks correctly', async () => {
    const store = createStore(model);
    const { user, getByRole } = setup(<AddTask list={list} />, { store });

    await user.type(
      getByRole('textbox', { name: new RegExp(`task name for "${list}"`, 'i') }),
      'My new task',
    );
    await user.click(
      getByRole('button', { name: new RegExp(`add task for "${list}"`, 'i') }),
    );

    const taskList = store.getState()[list].tasks;
    expect(taskList).toContainEqual({ id: expect.any(String), name: 'My new task' });
  });
});
