import {
  applyMiddleware,
  compose,
  createStore as reduxCreateStore,
} from 'redux'
import produce from 'immer'
import thunk from 'redux-thunk'

const isObject = x => typeof x === 'object' && !Array.isArray(x)

const get = (path, target) =>
  path.reduce(
    (acc, cur) => (isObject(acc) === 'object' ? acc[cur] : undefined),
    target,
  )

const set = (path, target, value) => {
  path.reduce((acc, cur, idx) => {
    if (idx + 1 === path.length) {
      acc[cur] = value
    } else {
      acc[cur] = acc[cur] || {}
    }
    return acc[cur]
  }, target)
}

const effectSymbol = Symbol('effect')

export const effect = fn => {
  // eslint-disable-next-line no-param-reassign
  fn[effectSymbol] = true
  return fn
}

export const createStore = (model, options = {}) => {
  const { devTools = true, middleware = [] } = options

  const definition = {
    ...model,
    logFullState: state => {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(state, null, 2))
    },
  }

  const references = {}
  const initialState = {}
  const actionEffects = {}
  const actionReducers = {}
  const actionCreators = {}

  const extract = (current, parentPath) =>
    Object.keys(current).forEach(key => {
      const value = current[key]
      const path = [...parentPath, key]
      if (typeof value === 'function') {
        if (value[effectSymbol]) {
          // Effect Action
          const action = payload =>
            value(references.dispatch, payload, {
              getState: references.getState,
            })
          set(path, actionEffects, action)

          // Effect Action Creator
          set(path, actionCreators, payload =>
            references.dispatch(() => Promise.resolve(action(payload))),
          )
        } else {
          // Reducer Action
          const action = (state, payload) =>
            produce(state, draft =>
              value(draft, payload, {
                dispatch: references.dispatch,
                dispatchLocal: get(path, references.dispatch),
                getState: references.getState,
              }),
            )
          action.actionName = path.join('.')
          set(path, actionReducers, action)

          // Reducer Action Creator
          set(path, actionCreators, payload =>
            references.dispatch({
              type: action.actionName,
              payload,
            }),
          )
        }
      } else if (isObject(value)) {
        extract(value, path)
      } else {
        // State
        set(path, initialState, value)
      }
    })

  extract(definition, [])

  const createReducers = (current, path) => {
    const actionReducersAtPath = Object.keys(current).reduce((acc, key) => {
      const value = current[key]
      if (typeof value === 'function' && !value[effectSymbol]) {
        return [...acc, value]
      }
      return acc
    }, [])
    const stateAtPath = Object.keys(current).reduce(
      (acc, key) => (isObject(current[key]) ? [...acc, key] : acc),
      [],
    )
    const nestedReducers = stateAtPath.map(key => [
      key,
      createReducers(current[key], [...path, key]),
    ])
    const defaultState = get(path, initialState)
    return (state = defaultState, action) => {
      const actionReducer = actionReducersAtPath.find(
        x => x.actionName === action.type,
      )
      if (actionReducer) {
        return actionReducer(state, action.payload)
      }
      for (let i = 0; i < nestedReducers.length; i += 1) {
        const [key, reducer] = nestedReducers[i]
        const newState = reducer(state[key], action)
        if (state[key] !== newState) {
          return {
            ...state,
            [key]: newState,
          }
        }
      }
      return state
    }
  }

  const reducers = createReducers(actionReducers, [])

  const composeEnhancers =
    devTools && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose

  const store = reduxCreateStore(
    reducers,
    initialState,
    composeEnhancers(applyMiddleware(thunk, ...middleware)),
  )

  // attach the action creators to dispatch
  Object.keys(actionCreators).forEach(key => {
    store.dispatch[key] = actionCreators[key]
  })

  references.dispatch = store.dispatch
  references.getState = store.getState

  return store
}
