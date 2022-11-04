import { createStore } from 'easy-peasy';
import { describe, it, expect } from 'vitest';

import model, { StoreModel } from '../../store/model';
import { setup } from '../../utils/test-utils';
import TaskList from './TaskList';

const listKeys: Array<keyof StoreModel> = ['todo', 'doing', 'done'];

describe.each(listKeys)('<TaskList list="%s" />', (list) => {
  it('should render the tasks correctly', () => {
    const store = createPopulatedStore();
    const { container } = setup(<TaskList list={list} />, { store });

    expect(container).toMatchSnapshot();
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
