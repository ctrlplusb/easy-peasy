import { action, createStore, actionOn } from '../../index';

const model = {
  todos: [],
  logs: [],
  addTodo: action((state, payload) => {
    state.todos.push(payload);
  }),
  onTodoAdded: actionOn(
    actions => actions.addTodo,
    (state, target) => {
      state.logs.push(`Added todo: ${target.payload}`);
    },
  ),
};

test('listener gets dispatched when target fires', () => {
  // arrange
  const store = createStore(model, {
    mockActions: true,
  });

  // act
  store.getActions().addTodo('Write docs');

  // assert
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
  // arrange
  const store = createStore(model);

  // act
  store.getListeners().onTodoAdded({
    type: '@action.addTodo',
    payload: 'Test listeners',
  });

  // assert
  expect(store.getState().logs).toEqual(['Added todo: Test listeners']);
});
