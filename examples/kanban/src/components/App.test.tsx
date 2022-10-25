import { createStore } from 'easy-peasy';
import { describe, it, expect } from 'vitest';
import model from '../store/model';
import { setup } from '../utils/test-utils';

import App from './App';

describe('<App />', () => {
  it('should render correctly', async () => {
    const { container } = setup(<App />);

    expect(container).toMatchSnapshot();
  });

  it('should render correctly for multiple tasks', async () => {
    const store = createStore(model);
    for (let i = 0; i < 3; i++) {
      store.getActions().todo.addTask({ id: `todo-${i}`, name: `Todo ${i}` });
      store.getActions().doing.addTask({ id: `doing-${i}`, name: `Doing ${i}` });
      store.getActions().done.addTask({ id: `done-${i}`, name: `Done ${i}` });
    }

    const { container } = setup(<App />, { store });

    expect(container).toMatchSnapshot();
  });

  it('should allow adding a todo and progressing it to done', async () => {
    const { user, getByRole } = setup(<App />);

    await user.type(getByRole('textbox', { name: /task name for "todo"/i }), 'My todo');
    await user.click(getByRole('button', { name: /add task for "todo"/i }));

    // Progress from todo -> doing
    await user.click(getByRole('button', { name: /progress "my todo"/i }));
    // Progress from doing -> done
    await user.click(getByRole('button', { name: /progress "my todo"/i }));

    const doneList = getByRole('list', {
      name: /Done/i,
    });
    expect(doneList).toMatchInlineSnapshot(`
      <ul
        aria-labelledby="done-heading"
        class="space-y-4"
      >
        <div
          class="relative p-4 py-2 rounded-md bg-white border border-slate-200 shadow-sm"
        >
          My todo
          <div
            class="flex"
          >
            <button
              aria-label="Regress \\"My todo\\""
              class="mr-auto"
            >
              ⏮️
            </button>
            <button
              aria-label="Remove \\"My todo\\""
              class="text-xs"
            >
              ❌
            </button>
          </div>
        </div>
      </ul>
    `);
  });
});
