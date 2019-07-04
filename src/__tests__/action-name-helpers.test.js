import {
  createStore,
  thunkStartName,
  thunkCompleteName,
  thunkFailName,
  actionName,
  thunk,
  action,
} from '../index';

const model = {
  todos: {
    fetch: thunk(() => {}),
    fetched: action(() => {}),
  },
};

const store = createStore(model);

test('thunkStartName', () => {
  // act
  const actual = thunkStartName(store.getActions().todos.fetch);

  // assert
  expect(actual).toBe('@thunk.todos.fetch(started)');
});

test('thunkCompleteName', () => {
  // act
  const actual = thunkCompleteName(store.getActions().todos.fetch);

  // assert
  expect(actual).toBe('@thunk.todos.fetch(completed)');
});

test('thunkFailName', () => {
  // act
  const actual = thunkFailName(store.getActions().todos.fetch);

  // assert
  expect(actual).toBe('@thunk.todos.fetch(failed)');
});

test('actionName', () => {
  // act
  const actual = actionName(store.getActions().todos.fetched);

  // assert
  expect(actual).toBe('@action.todos.fetched');
});
