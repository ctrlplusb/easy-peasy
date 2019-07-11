# Testing thunks

[Thunks](/docs/api/thunk) are more complicated to test than [actions](/docs/api/action) as they can perform side effects, such as invoking network requests, and they can additionally dispatch other [actions](/docs/api/action) or [thunks](/docs/api/thunk).

Each of your [actions](/docs/api/action) should ideally have their own isolated tests, therefore it may be unnecessary to test the state changes that resulted from [actions](/docs/api/action) being dispatched by your [thunk](/docs/api/thunk) under test. An alternative strategy would be to assert that the expected actions were dispatched from your [thunk](/docs/api/thunk) under test with the expected payloads. 

To support this strategy we expose an configuration value on the `createStore` API named `mockActions`. If you set the `mockActions` configuration value to `true`, then all actions that any action that is dispatched will not be executed, and will instead be recorded, along with their payloads. You can then access the recorded actions via the `getMockedActions` function that is available on the store instance. 

> We took inspiration for this strategy from the awesome [`redux-mock-store`](https://github.com/dmitry-zaets/redux-mock-store) package.

In addition to this, if you perform side effects such as network requests within your thunks, we highly recommend that you encapsulate these services within modules that are then exposed to your store via the `injections` configuration property of the store. Doing this will allow you to inject mocked versions of your services when you are testing your [thunks](/docs/api/thunk).

## Example

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
    fetchById: jest.fn(() => Promise.resolve(todo))
  };
  const store = createStore(todosModel, {
    injections: { todosService: mockService },
    mockActions: true,
  })

  // act
  await store.getActions().fetchById(todo.id)

  // assert
  expect(mockTodosService.fetchById).toHaveBeenCalledWith(todo.id);
  expect(store.getMockedActions()).toEqual([
    { type: '@thunk.fetchById(start)', payload: todo.id },
    { type: '@action.fetchedTodo', payload: todo },
    { type: '@thunk.fetchById(success)', payload: todo.id },
    { type: '@thunk.fetchById', payload: todo.id }
  ]);
})
```