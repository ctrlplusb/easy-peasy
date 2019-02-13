import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  Action,
  Actions,
  createStore,
  createTypedHooks,
  listen,
  Listen,
  reducer,
  Reducer,
  select,
  Select,
  State,
  StoreProvider,
  thunk,
  Thunk,
  useActions,
  useDispatch,
  useStore,
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
  login: Thunk<UserModel, { username: string; password: string }>
}

interface AuditModel {
  logs: string[]
  set: Action<AuditModel, string>
  newUserListeners: Listen<AuditModel>
  getNLog: Select<AuditModel, (n: number) => string | undefined>
}

interface StoreModel {
  todos: TodosModel
  user: UserModel
  counter: Reducer<number>
  audit: AuditModel
}

/**
 * Then you create your store.
 * Note that as we pass the Model into the `createStore` function, so all of our
 * model definition is typed correctly, including inside the actions/helpers etc.
 */
const userModel: UserModel = {
  token: undefined,
  loggedIn: (state, payload) => {
    state.token = payload
  },
  login: thunk(async (actions, payload) => {
    const response = await fetch('/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const { token } = await response.json()
    actions.loggedIn(token)
  }),
}
const store = createStore<StoreModel>({
  audit: {
    logs: [],
    set: (state, payload) => {
      state.logs.push(payload)
    },
    getNLog: select(state => (n: number) =>
      state.logs.length > n ? state.logs[n] : undefined,
    ),
    newUserListeners: listen(on => {
      on(userModel.login, (actions, payload) => {
        actions.set(`Logging in ${payload.username}`)
      })
    }),
  },
  todos: {
    items: [],
    firstItem: select(state =>
      state.items.length > 0 ? state.items[0] : undefined,
    ),
    addTodo: (state, payload) => {
      state.items.push(payload)
    },
  },
  user: userModel,
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

store.dispatch.todos.addTodo('jello')

const log1 = store.getState().audit.getNLog(1)

if (log1) {
  const logconcat = 'Debug ' + log1
  console.log(logconcat)
}

/**
 * You can access state via hooks
 */
function MyComponent() {
  const token = useStore((state: State<StoreModel>) => state.user.token)
  const { login } = useActions((dispatch: Actions<StoreModel>) => ({
    login: dispatch.user.login,
  }))
  const { addTodo } = useActions((actions: Actions<StoreModel>) => ({
    addTodo: actions.todos.addTodo,
  }))
  addTodo('Install easy peasy')
  const dispatch = useDispatch()
  dispatch({
    type: 'ADD_FOO',
    payload: 'bar',
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
  document.createElement('div'),
)

/**
 * We also support typing react-redux
 */

const Counter: React.SFC<{ counter: number }> = ({ counter }) => (
  <div>{counter}</div>
)

connect((state: State<StoreModel>) => ({
  counter: state.counter,
}))(Counter)

const typedHooks = createTypedHooks<StoreModel>()

typedHooks.useAction(actions => actions.todos.addTodo)('bar')
typedHooks.useActions(actions => actions.todos.addTodo)('bar')
typedHooks.useStore(state => state.todos.items).concat(['what'])
typedHooks.useDispatch().todos.addTodo('foo')
