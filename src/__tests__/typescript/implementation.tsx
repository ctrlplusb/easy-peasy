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
  Effect,
  Reducer,
  Select,
  State,
} from 'easy-peasy'
import { connect } from 'react-redux'

/**
 * Firstly you define your Model
 */

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
})

/**
 * You can use the "standard" store APIs
 */

console.log(store.getState().todos.firstItem)

store.dispatch({ type: 'COUNTER_INCREMENT' })

store.dispatch.todos.addTodo('Install typescript')

/**
 * You can access state via hooks
 */
function MyComponent() {
  //  As you can return "anything" from your mapState you need to provide the
  //  expected type of the mapped state. The state itself will be typed and
  //  then validated against the expected result type.
  //                                  👇
  const token = useStore<Model>(state => state.user.token)

  //  Similar to the mapState, the mapAction can return an action that accepts
  //  any "payload" type. Therefore we explicity state the payload type of the
  //  action we expect to be mapping out. This will be validated against the
  //  typed dispatch mounted actions.
  //                                  👇
  const login = useAction<Model, { username: string; password: string }>(
    dispatch => dispatch.user.login,
  )

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
