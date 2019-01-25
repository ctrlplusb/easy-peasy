import * as React from 'react'
import {
  createStore,
  effect,
  reducer,
  select,
  useAction,
  useStore,
  Action,
  Effect,
  Select,
  Reducer,
  StoreProvider,
} from 'easy-peasy'

enum Color {
  Red = 1,
  Green = 2,
  Blue = 3,
}

interface Injections {
  axios: { get: (url: string) => Promise<any> }
}

interface Todo {
  id: number
  text: string
}

interface TodosModel {
  items: Array<Todo>
  firstItem: Select<TodosModel, Todo | void>
  addItem: Action<TodosModel, Todo>
}

interface RouterState {
  history: {}
  push: () => undefined
}

interface NestedStuffModel {
  counter: number
  increment: Action<NestedStuffModel>
}

interface Model {
  name: string
  age: 35
  coords: [number, number]
  favouriteColor: Color
  todos: TodosModel
  foo: Effect<Model, Todo, void, Injections>
  bar: Action<Model>
  router: Reducer<RouterState>
  really: {
    ridiculously: {
      deeply: {
        nested: {
          stuff: NestedStuffModel
        }
      }
    }
  }
}

const todos: TodosModel = {
  items: [],
  firstItem: select(state => {
    return state.items.length > 0 ? state.items[0] : undefined
  }),
  addItem: (state, payload) => {
    state.firstItem
    state.items.push(payload)
  },
}

const model: Model = {
  name: 'Bob',
  age: 35,
  coords: [123, 456],
  favouriteColor: Color.Red,
  todos,
  foo: effect(async (dispatch, payload, getState, injections, meta) => {
    await injections.axios.get('http:/foo')
    dispatch.todos.addItem({ id: 1, text: 'foo' })
    const state = getState()
    state.todos
  }),
  bar: state => {
    state.age += 1
    state.todos.items
  },
  router: reducer((state = { history: [], push: () => undefined }, action) => {
    state.history
    return state
  }),
  really: {
    ridiculously: {
      deeply: {
        nested: {
          stuff: {
            counter: 1,
            increment: state => {},
          },
        },
      },
    },
  },
}

const store = createStore(model)

store.dispatch({
  type: 'MY_BESPOKE_ACTION',
  payload: 'I love redux'
})
store.getState().coords
store.getState().todos.firstItem
store.dispatch.todos.addItem({
  id: 1,
  text: 'Foo',
})
store.dispatch.really.ridiculously.deeply.nested.stuff.increment()

const counter = useStore<Model, number>(state => {
  return state.really.ridiculously.deeply.nested.stuff.counter
})

const addTodo = useAction<Model, Todo>(actions => {
  return actions.todos.addItem
})

addTodo({
  id: 1,
  text: 'foo',
})

const app = <StoreProvider store={store}>Woot!</StoreProvider>
