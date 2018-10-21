import { combineReducers, createStore } from 'redux'
import produce from 'immer'

const get = (path, target) => path.reduce((acc, cur) => acc[cur], target)

const easyPeasy = model => {
  const references = {}

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
  const initialState = extractInitialState(model)

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
  const extractActionHandlers = (current, path) =>
    Object.keys(current).reduce((innerAcc, key) => {
      const value = current[key]
      if (typeof value === 'function') {
        const handler = (state, payload) =>
          produce(state, draft => value(draft, payload))
        handler.actionName = `${path.join('.')}.${key}`
        return { ...innerAcc, [key]: handler }
      }
      if (typeof value === 'object' && !Array.isArray(value)) {
        const actions = extractActionHandlers(value, [...path, key])
        if (hasNestedAction(actions)) {
          return { ...innerAcc, [key]: actions }
        }
      }
      return innerAcc
    }, {})
  const actionHandlers = extractActionHandlers(model, [])

  const extractActions = current =>
    Object.keys(current).reduce((innerAcc, key) => {
      const value = current[key]
      if (typeof value === 'function') {
        const action = payload =>
          references.dispatch({
            type: value.actionName,
            payload,
          })
        return { ...innerAcc, [key]: action }
      }
      if (typeof value === 'object' && !Array.isArray(value)) {
        return { ...innerAcc, [key]: extractActions(value) }
      }
      return innerAcc
    }, {})
  const actions = extractActions(actionHandlers)

  const extractReducer = (current, path) => {
    const handlersAtPath = Object.keys(current).reduce((acc, key) => {
      const value = current[key]
      if (typeof value === 'function') {
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
        extractReducer(current[key], [...path, key]),
      ])
      const defaultState = get(path, initialState)
      return (state = defaultState, action) => {
        const handler = handlersAtPath.find(x => x.actionName === action.type)
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
          [key]: extractReducer(current[key], [...path, key]),
        }),
        {},
      ),
    )
  }

  const reducer = extractReducer(actionHandlers, [])

  const store = createStore(reducer, initialState)

  references.dispatch = store.dispatch

  return {
    store,
    actions,
  }
}

export default easyPeasy
