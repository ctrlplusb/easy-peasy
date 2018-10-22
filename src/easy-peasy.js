import {
  applyMiddleware,
  combineReducers,
  compose,
  createStore as reduxCreateStore,
} from 'redux'
import produce, { applyPatches } from 'immer'
import thunk from 'redux-thunk'

const get = (path, target) => path.reduce((acc, cur) => acc[cur], target)

const isPromise = x => typeof x === 'object' && typeof x.then === 'function'

const hasNestedAction = current =>
  Object.keys(current).reduce((acc, key) => {
    const value = current[key]
    if (typeof value === 'function') {
      return true
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      return acc || hasNestedAction(value)
    }
    return acc
  }, false)

const extractInitialState = current =>
  Object.keys(current).reduce((innerAcc, key) => {
    const value = current[key]
    if (typeof value === 'function') {
      return innerAcc
    }
    return {
      ...innerAcc,
      [key]:
        typeof value === 'object' && !Array.isArray(value)
          ? extractInitialState(value)
          : value,
    }
  }, {})

const effectSymbol = Symbol('effect')

export const effect = fn => {
  // eslint-disable-next-line no-param-reassign
  fn[effectSymbol] = true
  return fn
}

export const createStore = (model, options = {}) => {
  const { devTools = false } = options

  const definition = {
    ...model,
    logFullState: state => {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(state, null, 2))
    },
  }

  const references = {}

  const extractHandlers = (current, path) =>
    Object.keys(current).reduce((innerAcc, key) => {
      const value = current[key]
      if (typeof value === 'function') {
        let handler
        if (value[effectSymbol]) {
          // Effect
          handler = payload =>
            value(references.dispatch, payload, {
              getState: references.getState,
            })
          handler[effectSymbol] = true
        } else {
          // Reducer
          handler = (state, payload) =>
            produce(state, draft =>
              value(draft, payload, {
                dispatch: references.dispatch,
                dispatchLocal: get(path, references.dispatch),
                getState: references.getState,
              }),
            )
        }
        handler.handlerName = `${path.join('.')}.${key}`
        return { ...innerAcc, [key]: handler }
      }
      if (typeof value === 'object' && !Array.isArray(value)) {
        const actions = extractHandlers(value, [...path, key])
        if (hasNestedAction(actions)) {
          return { ...innerAcc, [key]: actions }
        }
      }
      return innerAcc
    }, {})

  const produceActionCreators = current =>
    Object.keys(current).reduce((innerAcc, key) => {
      const value = current[key]
      if (typeof value === 'function') {
        let action
        if (value[effectSymbol]) {
          action = payload => references.dispatch(() => value(payload))
        } else {
          action = payload =>
            references.dispatch({
              type: value.handlerName,
              payload,
            })
        }
        return { ...innerAcc, [key]: action }
      }
      if (typeof value === 'object' && !Array.isArray(value)) {
        return { ...innerAcc, [key]: produceActionCreators(value) }
      }
      return innerAcc
    }, {})

  const initialState = extractInitialState(definition)
  const handlers = extractHandlers(definition, [])
  const actionCreators = produceActionCreators(handlers)

  const createReducers = (current, path) => {
    const handlersAtPath = Object.keys(current).reduce((acc, key) => {
      const value = current[key]
      if (typeof value === 'function' && !value[effectSymbol]) {
        return [...acc, value]
      }
      return acc
    }, [])
    const stateAtPath = Object.keys(current).reduce((acc, key) => {
      const value = current[key]
      if (typeof value === 'object' && !Array.isArray(value)) {
        return [...acc, key]
      }
      return acc
    }, [])
    if (handlersAtPath.length > 0) {
      const nestedReducers = stateAtPath.map(key => [
        key,
        createReducers(current[key], [...path, key]),
      ])
      const defaultState = get(path, initialState)
      return (state = defaultState, action) => {
        const handler = handlersAtPath.find(x => x.handlerName === action.type)
        if (handler) {
          return handler(state, action.payload)
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
    return combineReducers(
      stateAtPath.reduce(
        (acc, key) => ({
          ...acc,
          [key]: createReducers(current[key], [...path, key]),
        }),
        {},
      ),
    )
  }

  const reducers = createReducers(handlers, [])

  const composeEnhancers =
    devTools && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose

  const store = reduxCreateStore(
    reducers,
    initialState,
    composeEnhancers(applyMiddleware(thunk)),
  )

  // attach the action creators to dispatch
  Object.keys(actionCreators).forEach(key => {
    store.dispatch[key] = actionCreators[key]
  })

  references.dispatch = store.dispatch
  references.getState = store.getState

  return store
}
