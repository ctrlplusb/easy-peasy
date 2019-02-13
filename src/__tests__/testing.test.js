import React from 'react'
import { render, fireEvent } from 'react-testing-library'
import {
  actionName,
  createStore,
  StoreProvider,
  thunk,
  thunkStartName,
  thunkCompleteName,
  useStore,
  useActions,
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
  expect(store.getState()).toEqual({ items: {} }) // No actual actions were run

  // act
  store.clearMockedActions()

  // assert
  expect(fetch).toHaveBeenCalledWith(`/todos/${todo.id}`)
  expect(store.getMockedActions()).toEqual([])
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

it('component "integration" test', () => {
  // arrange
  function ComponentUnderTest() {
    const count = useStore(state => state.count)
    const increment = useActions(actions => actions.increment)
    return (
      <div>
        Count: <span data-testid="count">{count}</span>
        <button type="button" onClick={increment}>
          +
        </button>
      </div>
    )
  }

  const store = createStore({
    count: 0,
    increment: state => {
      state.count += 1
    },
  })

  const app = (
    <StoreProvider store={store}>
      <ComponentUnderTest />
    </StoreProvider>
  )

  // act
  const { getByTestId, getByText } = render(app)

  // assert
  expect(getByTestId('count').textContent).toEqual('0')

  // act
  fireEvent.click(getByText('+'))

  // assert
  expect(getByTestId('count').textContent).toEqual('1')
})
