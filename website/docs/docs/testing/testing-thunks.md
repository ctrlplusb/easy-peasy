# Testing thunks

[Thunks](/docs/api/thunk) are more complicated to test than [actions](/docs/api/action) as they can perform side effects, such as invoking network requests, and they can additionally dispatch other [actions](/docs/api/action) or [thunks](/docs/api/thunk).

There are also 2 different strategies at testing thunks:

1. Mock actions dispatched by your thunks and assert that the expected thunks were called with the expected payloads
1. Allow thunks to execute naturally, asserting the state changes that may have occurred due to the actions being dispatched by your thunk

Each strategy has it's own merits and a pragmatic approach should be taken to deciding which strategy would provide the most value on a case by case basis.

Within either of these strategies your thunks may perform side effects such as making network requests. We highly recommend that you encapsulate these side effects within modules that are then exposed to your store via the `injections` configuration property of the store. Doing this will allow you to inject mocked versions of your services when you are testing your [thunks](/docs/api/thunk).

## Strategy 1: mocking actions

The `createStore` API contains a configuration property named `mockActions`, which if set to `true`, will ensure that any action that is dispatched will not be executed, and will instead be recorded - along with their payloads. You can then access the recorded actions via the `getMockedActions` function that is available on the store instance. 

> We took inspiration for this strategy from the awesome [`redux-mock-store`](https://github.com/dmitry-zaets/redux-mock-store) package.

Given the following model under test:

```typescript
import { action, thunk } from 'thunk';

const todosModel = {
  items: {},
  fetchedTodo: action((state, payload) => {
    state.items[payload.id] = payload
  }),
  fetchById: thunk(async (actions, payload, { injections }) => {
    const { todosService } = injections;
    const todo = await todosService.fetchById(payload);
    actions.fetchedTodo(todo);
  })
};
```

We could test the `fetchById` thunk like so:

```typescript
import { createStore, actionName } from 'easy-peasy'

const createMockTodosService = result =>
  jest.fn(() => Promise.resolve({ json: () => Promise.resolve(response) }))

test('fetchById', async () => {
  // arrange
  const todo = { id: 1, text: 'Test my store' };
  const mockTodosService = {
    fetchById: jest.fn(() => Promise.resolve(todo)),
  };
  const store = createStore(todosModel, {
    injections: { todosService: mockTodosService },
    mockActions: true,
  });

  // act
  await store.getActions().fetchById(todo.id);

  // assert
  expect(mockTodosService.fetchById).toHaveBeenCalledWith(todo.id);
  expect(store.getMockedActions()).toEqual([
    { type: '@thunk.fetchById(start)', payload: todo.id },
    { type: '@action.fetchedTodo', payload: todo },
    { type: '@thunk.fetchById(success)', payload: todo.id },
    { type: '@thunk.fetchById', payload: todo.id },
  ]);
})
```

## Strategy 2: executing naturally

Within the below tests we will not be mocking any actions. i.e. we will allow thunks to execute naturally. This means that any actions that are called within a thunk will be executed.

This provides more of an integration test as you are crossing boundaries, executing actions outside of your thunk.

You would then generally make two different types of assertions within
this strategy:

  1. Were the mocked injections called as expected?
  2. Did the state get updated in the expected manner?

```javascript
test('fetchById', () => {
  // arrange
  const todo = { id: 1, text: 'Test my store' };
  const mockTodosService = {
    fetchById: jest.fn(() => Promise.resolve(todo)),
  };
  const store = createStore(todosModel, {
    injections: { todosService: mockTodosService },
  });

  // act
  await store.getActions().fetchById(todo.id);

  // assert
  expect(mockTodosService.fetchById).toHaveBeenCalledWith(todo.id);
  expect(store.getState()).toEqual({
    items: {
      1: todo,
    },
  });
})
```