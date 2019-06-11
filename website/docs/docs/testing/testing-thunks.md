# Testing thunks

[Thunks](/docs/api/thunk) are more complicated to test than [actions](/docs/api/action) as they can perform side effects, such as invoking network requests, and can dispatch [actions](/docs/api/action).

We recommend that you have tests for your [actions](/docs/api/action), and therefore you shouldn't need to test for state changes that resulted from [actions](/docs/api/action) that were dispatched by your [thunk](/docs/api/thunk). 

We rather recommend that you test for what actions were fired from your thunk under test.

To do this we expose an additional configuration value on the `createStore` API, specifically `mockActions`. If you set the `mockActions` configuration value, then all actions that are dispatched will not affect state, and will instead be mocked and recorded. You can get access to the recorded actions via the `getMockedActions` function that is available on the store instance. We took inspiration for this functionality from the awesome [`redux-mock-store`](https://github.com/dmitry-zaets/redux-mock-store) package.

In addition to this approach, if you perform side effects such as network requests within your thunks, we highly recommend that you expose the modules you use to do so via the `injections` configuration variable of your store. If you do this then it makes it significantly easier to provide mocked instances to your thunks when testing.

We will demonstrate all of the above within the below example.

Given the following model under test:

```typescript
import { action, thunk } from 'thunk';

const todosModel = {
  items: {},
  add: action((state, payload) => {
    state.items[payload.id] = payload
  }),
  fetchById: thunk(async (actions, payload, helpers) => {
    const { injections } = helpers
    const todo = await injections.fetch(`/todos/${payload}`).then(r => r.json())
    actions.add(todo)
  }),
}
```

We could test it like so:

```typescript
import { createStore, actionName, thunkStartName, thunkCompleteName, thunkFailName } from 'easy-peasy'

const createFetchMock = response =>
  jest.fn(() => Promise.resolve({ json: () => Promise.resolve(response) }))

test('fetchById', async () => {
  // arrange
  const todo = { id: 1, text: 'Test my store' }
  const fetch = createFetchMock(todo)
  const store = createStore(todosModel, {
    injections: { fetch },
    mockActions: true,
  })

  // act
  await store.dispatch.fetchById(todo.id)

  // assert
  expect(fetch).toHaveBeenCalledWith(`/todos/${todo.id}`)
  expect(store.getMockedActions()).toEqual([
    { type: thunkStartName(todosModel.fetchById), payload: todo.id },
    { type: actionName(todosModel.add), payload: todo },
    { type: thunkCompleteName(todosModel.fetchById), payload: todo.id },
  ])
})
```