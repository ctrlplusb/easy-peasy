/* eslint-disable no-param-reassign */

import {
  applyMiddleware,
  compose as reduxCompose,
  createStore as reduxCreateStore,
} from 'redux'
import memoizerific from 'memoizerific'
import produce from 'immer'
import thunk from 'redux-thunk'
import { isStateObject } from './lib'

const maxSelectFnMemoize = 100

const actionNameSymbol = '__actionName__'
const effectSymbol = '__effect__'
const listenersSymbol = '__listeners__'
const selectSymbol = '__select__'
const selectImpSymbol = '__selectImp__'
const selectDependenciesSymbol = '__selectDependencies__'
const selectStateSymbol = '__selectState__'
const reducerSymbol = '__reducer__'

const get = (path, target) =>
  path.reduce((acc, cur) => (isStateObject(acc) ? acc[cur] : undefined), target)

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

const tick = () => new Promise(resolve => setTimeout(resolve))

const startsWith = (target, search) =>
  target.substr(0, search.length) === search

export const effect = fn => {
  fn[effectSymbol] = true
  return fn
}

export const select = (fn, dependencies) => {
  fn[selectSymbol] = true
  fn[selectDependenciesSymbol] = dependencies
  fn[selectStateSymbol] = {}
  return fn
}

export const reducer = fn => {
  fn[reducerSymbol] = true
  return fn
}

export const listeners = fn => {
  fn[listenersSymbol] = true
  return fn
}

export const createStore = (model, options = {}) => {
  const {
    devTools = true,
    disableInternalSelectFnMemoize = false,
    middleware = [],
    initialState = {},
    injections,
    compose,
    reducerEnhancer = rootReducer => rootReducer,
  } = options

  const wrapFnWithMemoize = x =>
    !disableInternalSelectFnMemoize && typeof x === 'function'
      ? memoizerific(maxSelectFnMemoize)(x)
      : x

  const definition = {
    ...model,
    logFullState: state => {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(state, null, 2))
    },
  }

  const references = {}
  const defaultState = {}
  const actionEffects = {}
  const actionCreators = {}
  const actionCreatorDict = {}
  const actionReducers = {}
  const customReducers = []
  const selectorReducers = []
  const listenerDefinitions = []
  const listenerDict = {}

  const dispatchListenersForAction = (actionName, payload) => {
    const listenersForAction = listenerDict[actionName]
    return listenersForAction && listenersForAction.length > 0
      ? Promise.all(
          listenersForAction.map(listenerForAction =>
            listenerForAction(
              references.dispatch,
              payload,
              references.getState,
              injections,
            ),
          ),
        )
      : Promise.resolve()
  }

  const extract = (current, parentPath) =>
    Object.keys(current).forEach(key => {
      const value = current[key]
      const path = [...parentPath, key]
      if (typeof value === 'function') {
        if (value[selectSymbol]) {
          // skip
          value[selectStateSymbol] = { parentPath, key, executed: false }
          selectorReducers.push(value)
        } else if (value[effectSymbol]) {
          // Effect Action
          const actionName = `@effect.${path.join('.')}`
          const action = payload => {
            if (devTools) {
              references.dispatch({
                type: actionName,
                payload,
              })
            }
            return value(
              references.dispatch,
              payload,
              references.getState,
              injections,
              {
                parent: parentPath,
                path,
              },
            )
          }
          action.actionName = actionName
          set(path, actionEffects, action)

          // Effect Action Creator
          const actionCreator = payload =>
            tick()
              .then(() => references.dispatch(() => action(payload)))
              .then(result => {
                dispatchListenersForAction(
                  actionCreator[actionNameSymbol],
                  payload,
                )
                return result
              })
          actionCreator[actionNameSymbol] = actionName
          actionCreatorDict[actionName] = actionCreator
          set(path, actionCreators, actionCreator)
        } else if (value[reducerSymbol]) {
          customReducers.push({ path, reducer: value })
        } else if (value[listenersSymbol]) {
          listenerDefinitions.push(value)
        } else {
          // Reducer Action
          const actionName = `@action.${path.join('.')}`
          const action = (state, payload) =>
            produce(state, draft =>
              value(draft, payload, {
                dispatch: references.dispatch,
                dispatchLocal: get(path, references.dispatch),
                getState: references.getState,
              }),
            )
          action.actionName = actionName
          set(path, actionReducers, action)

          // Reducer Action Creator
          const actionCreator = payload => {
            const result = references.dispatch({
              type: action.actionName,
              payload,
            })
            dispatchListenersForAction(actionCreator[actionNameSymbol], payload)
            return result
          }
          actionCreator[actionNameSymbol] = actionName
          actionCreatorDict[actionName] = actionCreator
          set(path, actionCreators, actionCreator)
        }
      } else if (isStateObject(value) && Object.keys(value).length > 0) {
        extract(value, path)
      } else {
        // State
        const initialParentRef = get(parentPath, initialState)
        if (initialParentRef && key in initialParentRef) {
          set(path, defaultState, initialParentRef[key])
        } else {
          set(path, defaultState, value)
        }
      }
    })

  extract(definition, [])

  selectorReducers.forEach(selector => {
    selector[selectImpSymbol] = memoizerific(1)(state =>
      wrapFnWithMemoize(selector(state)),
    )
  })

  listenerDefinitions.forEach(def => {
    const on = (actionCreator, handler) => {
      if (
        typeof actionCreator === 'function' &&
        actionCreator[actionNameSymbol] &&
        actionCreatorDict[actionCreator[actionNameSymbol]]
      ) {
        listenerDict[actionCreator[actionNameSymbol]] =
          listenerDict[actionCreator[actionNameSymbol]] || []
        listenerDict[actionCreator[actionNameSymbol]].push(handler)
      }
    }
    def(actionCreators, on)
  })

  const createReducers = () => {
    const createActionsReducer = (current, path) => {
      const actionReducersAtPath = Object.keys(current).reduce((acc, key) => {
        const value = current[key]
        if (typeof value === 'function' && !value[effectSymbol]) {
          return [...acc, value]
        }
        return acc
      }, [])
      const stateAtPath = Object.keys(current).reduce(
        (acc, key) => (isStateObject(current[key]) ? [...acc, key] : acc),
        [],
      )
      const nestedReducers = stateAtPath.map(key => [
        key,
        createActionsReducer(current[key], [...path, key]),
      ])
      return (state = get(path, defaultState), action) => {
        // short circuit effects as they are noop in reducers
        if (startsWith(action.type, '@effect.')) {
          return state
        }
        // short circuit actions if they aren't a match on current path
        if (
          path.length > 0 &&
          !startsWith(action.type, `@action.${path.join('.')}`)
        ) {
          return state
        }
        const actionReducer = actionReducersAtPath.find(
          x => x.actionName === action.type,
        )
        if (actionReducer) {
          return actionReducer(state, action.payload)
        }
        for (let i = 0; i < nestedReducers.length; i += 1) {
          const [key, red] = nestedReducers[i]
          const newState = red(state[key], action)
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

    const reducerForActions = createActionsReducer(actionReducers, [])

    const reducerWithCustom =
      customReducers.length > 0
        ? (state, action) => {
            const stateAfterActions = reducerForActions(state, action)
            return produce(stateAfterActions, draft => {
              customReducers.forEach(({ path: p, reducer: red }) => {
                const current = get(p, draft)
                set(p, draft, red(current, action))
              })
            })
          }
        : reducerForActions

    const runSelectorReducer = (state, selector) => {
      const { parentPath, key, executed } = selector[selectStateSymbol]
      if (executed) {
        return state
      }
      const dependencies = selector[selectDependenciesSymbol]

      const stateAfterDependencies = dependencies
        ? dependencies.reduce(runSelectorReducer, state)
        : state

      let newState = state

      if (parentPath.length > 0) {
        const target = get(parentPath, stateAfterDependencies)
        if (target) {
          const newValue = selector[selectImpSymbol](target)
          newState = produce(state, draft => {
            const updateTarget = get(parentPath, draft)
            updateTarget[key] = newValue
          })
        }
      } else {
        const newValue = selector[selectImpSymbol](stateAfterDependencies)
        newState = produce(state, draft => {
          draft[key] = newValue
        })
      }

      selector[selectStateSymbol].executed = true
      return newState
    }

    const runSelectors = state =>
      selectorReducers.reduce(runSelectorReducer, state)

    let isInitial = true

    return selectorReducers.length > 0
      ? (state, action) => {
          const stateAfterActions = reducerWithCustom(state, action)
          if (state !== stateAfterActions || isInitial) {
            const stateAfterSelectors = runSelectors(stateAfterActions)
            isInitial = false
            selectorReducers.forEach(selector => {
              selector[selectStateSymbol].executed = false
            })
            return stateAfterSelectors
          }
          return stateAfterActions
        }
      : reducerWithCustom
  }

  const reducers = createReducers()

  const composeEnhancers =
    compose ||
    (devTools &&
    typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : reduxCompose)

  const store = reduxCreateStore(
    reducerEnhancer(reducers),
    defaultState,
    composeEnhancers(applyMiddleware(thunk, ...middleware)),
  )

  // attach the action creators to dispatch
  Object.keys(actionCreators).forEach(key => {
    store.dispatch[key] = actionCreators[key]
  })

  references.dispatch = store.dispatch
  references.getState = store.getState
  references.getState.getState = store.getState

  return store
}
