import {
  actionName,
  createStore,
  thunk,
  thunkStartName,
  thunkEndName,
} from '../index'

const todosModel = {
  items: {},
  add: (state, payload) => {
    state.items[payload.id] = payload
  },
  fetchById: thunk(async (actions, payload, helpers) => {
    const { injections } = helpers
    const todo = await injections.fetch(`/todos/${payload}`).then(r => r.json())
    actions.add(todo)
  }),
}

const createFetchMock = response =>
  jest.fn(() => Promise.resolve({ json: () => Promise.resolve(response) }))

it('thunk', async () => {
  // arrange
  const todo = { id: 1, text: 'Test my store' }
  const fetch = createFetchMock(todo)
  const store = createStore(todosModel, {
    injections: { fetch },
    recordActions: true,
  })

  // act
  await store.dispatch.fetchById(todo.id)

  // assert
  expect(fetch).toHaveBeenCalledWith(`/todos/${todo.id}`)
  expect(store.dispatched).toEqual([
    { type: thunkStartName(todosModel.fetchById), payload: todo.id },
    { type: actionName(todosModel.add), payload: todo },
    { type: thunkEndName(todosModel.fetchById), payload: todo.id },
  ])
})

it('action', () => {
  // arrange
  const todo = { id: 1, text: 'foo' }
  const store = createStore(todosModel)

  // act
  store.dispatch.add(todo)

  // assert
  expect(store.getState().items).toEqual({ [todo.id]: todo })
})
