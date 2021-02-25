import { action, createStore, actionOn } from '../../src';

const model = {
  todos: [],
  logs: [],
  addTodo: action((state, payload) => {
    state.todos.push(payload);
  }),
  onTodoAdded: actionOn(
    (actions) => actions.addTodo,
    (state, target) => {
      state.logs.push(`Added todo: ${target.payload}`);
    },
  ),
};

test('listener gets dispatched when target fires', () => {
  // ARRANGE
  const store = createStore(model, {
    mockActions: true,
  });

  // ACT
  store.getActions().addTodo('Write docs');

  // ASSERT
  expect(store.getMockedActions()).toMatchObject([
    { type: '@action.addTodo', payload: 'Write docs' },
    {
      type: '@actionOn.onTodoAdded',
      payload: {
        type: '@action.addTodo',
        payload: 'Write docs',
      },
    },
  ]);
});

test('listener acts as expected', () => {
  // ARRANGE
  const store = createStore(model);

  // ACT
  store.getListeners().onTodoAdded({
    type: '@action.addTodo',
    payload: 'Test listeners',
  });

  // ASSERT
  expect(store.getState().logs).toEqual(['Added todo: Test listeners']);
});
