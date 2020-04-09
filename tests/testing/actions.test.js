/**
 * These tests show how you can test actions.  They are probably the most simple
 * of tests as actions are merely an update to the store state. Therefore to
 * test an action you can simply fire it and then assert against the expected
 * state of your store.
 */

import { action, createStore } from '../../src';

const todosModel = {
  items: {},
  add: action((state, payload) => {
    state.items[payload.id] = payload;
  }),
};

it('state gets updated', () => {
  // arrange
  const todo = { id: 1, text: 'foo' };
  const store = createStore(todosModel);

  // act
  store.getActions().add(todo);

  // assert
  expect(store.getState().items).toEqual({ [todo.id]: todo });
});
