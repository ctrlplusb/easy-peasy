import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  createStore,
  effect,
  reducer,
  select,
  StoreProvider,
  useAction,
  useStore,
  Action,
  Dispatch,
  Effect,
  Reducer,
  Select,
  State,
} from 'easy-peasy'
import { connect } from 'react-redux'

/**
 * Firstly you define your Model
 */

interface Injections {
  appId: string
}

interface TodosModel {
  items: Array<string>
  firstItem: Select<TodosModel, string | void>
  addTodo: Action<TodosModel, string>
}

interface UserModel {
  token?: string
  loggedIn: Action<UserModel, string>
  login: Effect<Model, { username: string; password: string }>
}

interface Model {
  todos: TodosModel
  user: UserModel
  counter: Reducer<number>
  printDebugInfo: Effect<Model, void, Injections, Promise<string>>
  sayHello: Effect<Model, void, Injections>
}

/**
 * Then you create your store.
 * Note that as we pass the Model into the `createStore` function, so all of our
 * model definition is typed correctly, including inside the actions/helpers etc.
 */

const store = createStore<Model>({
  todos: {
    items: [],
    firstItem: select(state =>
      state.items.length > 0 ? state.items[0] : undefined,
    ),
    addTodo: (state, payload) => {
      state.items.push(payload)
    },
  },
  user: {
    token: undefined,
    loggedIn: (state, payload) => {
      state.token = payload
    },
    login: effect(async (dispatch, payload) => {
      const response = await fetch('/login', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const { token } = await response.json()
      dispatch.user.loggedIn(token)
    }),
  },
  counter: reducer((state = 0, action) => {
    switch (action.type) {
      case 'COUNTER_INCREMENT':
        return state + 1
      default:
        return state
    }
  }),
  printDebugInfo: effect(async (state, payload, getState, injections) => {
    const msg = `App id: ${injections.appId}`
    console.log(msg)
    return msg
  }),
  sayHello: effect(() => {
    console.log('Hello world')
  }),
})

/**
 * You can use the "standard" store APIs
 */

console.log(store.getState().todos.firstItem)

store.dispatch({ type: 'COUNTER_INCREMENT' })

store.dispatch.todos.addTodo('jello')
store.dispatch.printDebugInfo()

/**
 * You can access state via hooks
 */
function MyComponent() {
  const token = useStore((state: State<Model>) => state.user.token)
  const { login, printDebugInfo, sayHello } = useAction(
    (dispatch: Dispatch<Model>) => ({
      login: dispatch.user.login,
      printDebugInfo: dispatch.printDebugInfo,
      sayHello: dispatch.sayHello,
    }),
  )
  printDebugInfo().then(result => {
    console.log(result + 'should_be_string')
  })
  sayHello().then(() => {
    console.log('Goodbye')
  })
  return (
    <button onClick={() => login({ username: 'foo', password: 'bar' })}>
      {token || 'Log in'}
    </button>
  )
}

/**
 * Expose the store to your app as normal
 */

ReactDOM.render(
  <StoreProvider store={store}>
    <MyComponent />
  </StoreProvider>,
  document.getElementById('root'),
)

/**
 * We also support typing react-redux
 */

const Counter: React.SFC<{ counter: number }> = ({ counter }) => (
  <div>{counter}</div>
)

connect((state: State<Model>) => ({
  counter: state.counter,
}))(Counter)
