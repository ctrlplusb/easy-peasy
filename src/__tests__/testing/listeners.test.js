import { action, createStore, model, actionOn } from '../../index';

const storeModel = model({
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
});

test('listener gets dispatched when target fires', () => {
  // arrange
  const store = createStore(storeModel, {
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
  const store = createStore(storeModel);

  // act
  store.getListeners().onTodoAdded({
    type: '@action.addTodo',
    payload: 'Test listeners',
  });

  // assert
  expect(store.getState().logs).toEqual(['Added todo: Test listeners']);
});
