import {
  applyMiddleware,
  compose as reduxCompose,
  createStore as reduxCreateStore,
} from 'redux'
import memoizerific from 'memoizerific'
import produce, { setAutoFreeze } from 'immer'
import reduxThunk from 'redux-thunk'
import { isStateObject } from './lib'

/**
 * immer is an implementation detail, so we are not going to use its auto freeze
 * behaviour, which throws errors if trying to mutate state. It's also risky
 * for production builds as has a perf overhead.
 *
 * @see https://github.com/mweststrate/immer#auto-freezing
 */
setAutoFreeze(false)

const maxSelectFnMemoize = 100

const actionSymbol = '__action__'
const actionNameSymbol = '__actionName__'
const thunkSymbol = '__thunk__'
const listenSymbol = '__listen__'
const metaSymbol = '__meta__'
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

export const helpers = {
  actionName: action => action[actionNameSymbol],
  thunkStartName: action => `${action[actionNameSymbol]}(started)`,
  thunkCompleteName: action => `${action[actionNameSymbol]}(completed)`,
  action: fn => {
    fn[actionSymbol] = true
    return fn
  },
  thunk: fn => {
    fn[thunkSymbol] = true
    return fn
  },
  select: (fn, dependencies) => {
    fn[selectSymbol] = true
    fn[selectDependenciesSymbol] = dependencies
    fn[selectStateSymbol] = {}
    return fn
  },
  reducer: fn => {
    fn[reducerSymbol] = true
    return fn
  },
  listen: fn => {
    fn[listenSymbol] = true
    return fn
  },
}

const createStoreInternals = ({
  model,
  injections,
  initialState,
  disableInternalSelectFnMemoize,
  references,
}) => {
  const wrapFnWithMemoize = x =>
    !disableInternalSelectFnMemoize && typeof x === 'function'
      ? memoizerific(maxSelectFnMemoize)(x)
      : x

  const definition = {
    ...model,
    logFullState: helpers.thunk((actions, payload, { getState }) => {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(getState(), null, 2))
    }),
  }

  const defaultState = {}
  const actionThunks = {}
  const actionCreators = {}
  const actionCreatorDict = {}
  const customReducers = []
  const selectorReducers = []
  const listenDefinitions = []
  const thunkListenersDict = {}
  const actionListenersDict = {}
  const actionReducersDict = {}
  const actionReducersForPath = {}

  const extract = (current, parentPath) =>
    Object.keys(current).forEach(key => {
      const value = current[key]
      const path = [...parentPath, key]
      const meta = {
        parent: parentPath,
        path,
      }
      if (typeof value === 'function') {
        if (value[actionSymbol]) {
          const name = `@action.${path.join('.')}`
          value[actionNameSymbol] = name
          value[metaSymbol] = meta

          // Action Reducer
          const actionReducer = value
          actionReducer[actionNameSymbol] = name
          actionReducersDict[name] = actionReducer
          actionReducersForPath[parentPath] = actionReducer

          // Action Creator
          const actionCreator = payload => {
            const result = references.dispatch({
              type: actionReducer[actionNameSymbol],
              payload,
            })
            return result
          }
          actionCreator[actionNameSymbol] = name
          actionCreatorDict[name] = actionCreator
          set(path, actionCreators, actionCreator)
        } else if (value[selectSymbol]) {
          // skip
          value[selectStateSymbol] = { parentPath, key, executed: false }
          selectorReducers.push(value)
        } else if (value[thunkSymbol]) {
          const name = `@thunk.${path.join('.')}`
          value[actionNameSymbol] = name

          // Thunk Action
          const action = payload => {
            return value(get(parentPath, actionCreators), payload, {
              dispatch: references.dispatch,
              getState: references.getState,
              injections,
              meta,
            })
          }
          set(path, actionThunks, action)

          // Thunk Action Creator
          const actionCreator = payload =>
            tick()
              .then(() =>
                references.dispatch({
                  type: `${name}(started)`,
                  payload,
                }),
              )
              .then(() => references.dispatch(() => action(payload)))
              .then(result => {
                references.dispatch({
                  type: `${name}(completed)`,
                  payload,
                })
                return result
              })
              .catch(err => {
                references.dispatch({
                  type: `${name}(failed)`,
                  payload: err,
                })
                return Promise.reject(err)
              })

          actionCreator[actionNameSymbol] = name
          actionCreatorDict[name] = actionCreator
          set(path, actionCreators, actionCreator)
        } else if (value[reducerSymbol]) {
          customReducers.push({ path, reducer: value })
        } else if (value[listenSymbol]) {
          listenDefinitions.push(value)
          value[metaSymbol] = meta
        } else {
          // eslint-disable-next-line no-console
          console.warn(
            `Easy Peasy: Found a function at path ${path.join(
              '.',
            )} in your model. Version 2 required that you wrap functions with the action helper`,
          )
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
    selector[selectImpSymbol] = state => wrapFnWithMemoize(selector(state))
  })

  listenDefinitions.forEach(def => {
    const on = (target, handler) => {
      if (typeof handler !== 'function') {
        return
      }

      const meta = def[metaSymbol]
      handler[metaSymbol] = meta

      if (!handler[actionSymbol] && !handler[thunkSymbol]) {
        // eslint-disable-next-line
        console.warn(
          `Easy Peasy: you must provide either an "action" or "thunk" to your listeners. Found an invalid handler at "${meta.path.join(
            '.',
          )}"`,
        )
        return
      }

      let name

      if (
        typeof target === 'function' &&
        target[actionNameSymbol] &&
        actionCreatorDict[target[actionNameSymbol]]
      ) {
        if (target[thunkSymbol]) {
          name = helpers.thunkCompleteName(target)
        } else {
          name = target[actionNameSymbol]
        }
      } else if (typeof target === 'string') {
        name = target
      }

      if (name) {
        if (handler[thunkSymbol]) {
          thunkListenersDict[name] = thunkListenersDict[name] || []
          thunkListenersDict[name].push(handler)
        } else {
          actionListenersDict[name] = actionListenersDict[name] || []
          actionListenersDict[name].push({
            path: meta.parent,
            handler,
          })
        }
      }
    }
    def(on)
  })

  const createReducers = () => {
    const runActionReducerAtPath = (state, action, actionReducer, path) => {
      const current = get(path, state)
      if (path.length === 0) {
        return produce(state, _draft => actionReducer(_draft, action.payload))
      }
      return produce(state, draft => {
        set(
          actionReducer[metaSymbol].parent,
          draft,
          produce(current, _draft => actionReducer(_draft, action.payload)),
        )
      })
    }

    const reducerForActions = (state, action) => {
      const actionReducer = actionReducersDict[action.type]
      if (actionReducer) {
        return runActionReducerAtPath(
          state,
          action,
          actionReducer,
          actionReducer[metaSymbol].parent,
        )
      }
      return state
    }

    const reducerForListeners = (state, action) => {
      const actionListeners = actionListenersDict[action.type]
      if (actionListeners) {
        return actionListeners.reduce(
          (newState, { path, handler }) =>
            runActionReducerAtPath(newState, action, handler, path),
          state,
        )
      }
      return state
    }

    const reducerForCustomReducers = (state, action) => {
      return produce(state, draft => {
        customReducers.forEach(({ path: p, reducer: red }) => {
          const current = get(p, draft)
          set(p, draft, red(current, action))
        })
      })
    }

    const runSelectorReducer = (state, selector) => {
      const { parentPath, key, executed } = selector[selectStateSymbol]
      if (executed) {
        return state
      }
      const dependencies = selector[selectDependenciesSymbol]

      const stateAfterDependencies = dependencies
        ? dependencies.reduce(runSelectorReducer, state)
        : state

      let newState = stateAfterDependencies

      if (parentPath.length > 0) {
        const target = get(parentPath, stateAfterDependencies)
        if (target) {
          if (!selector.prevState || selector.prevState !== state) {
            const newValue = selector[selectImpSymbol](target)
            newState = produce(state, draft => {
              const updateTarget = get(parentPath, draft)
              updateTarget[key] = newValue
            })
            selector.prevState = newState
          }
        }
      } else if (!selector.prevState || selector.prevState !== state) {
        const newValue = selector[selectImpSymbol](stateAfterDependencies)
        newState = produce(state, draft => {
          draft[key] = newValue
        })
        selector.prevState = newState
      }

      selector[selectStateSymbol].executed = true
      return newState
    }

    const runSelectors = state =>
      selectorReducers.reduce(runSelectorReducer, state)

    let isInitial = true

    const selectorsReducer = state => {
      const stateAfterSelectors = runSelectors(state)
      isInitial = false
      selectorReducers.forEach(selector => {
        selector[selectStateSymbol].executed = false
      })
      return stateAfterSelectors
    }

    return (state, action) => {
      const stateAfterActions = reducerForActions(state, action)
      const stateAfterListeners = reducerForListeners(stateAfterActions, action)
      const stateAfterCustomReducers = reducerForCustomReducers(
        stateAfterListeners,
        action,
      )
      if (state !== stateAfterCustomReducers || isInitial) {
        return selectorsReducer(stateAfterCustomReducers)
      }
      return stateAfterCustomReducers
    }
  }

  return {
    reducer: createReducers(),
    defaultState,
    actionCreators,
    thunkListenersDict,
  }
}

export const createStore = (model, options = {}) => {
  const {
    compose,
    devTools = true,
    disableInternalSelectFnMemoize = false,
    initialState = {},
    injections,
    mockActions = false,
    middleware = [],
    reducerEnhancer = rootReducer => rootReducer,
  } = options

  const references = {}

  const composeEnhancers =
    compose ||
    (devTools &&
    typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : reduxCompose)

  let mockedActions = []

  const mockActionsMiddlware = () => next => action => {
    if (mockActions) {
      mockedActions.push(action)
      return undefined
    }
    return next(action)
  }

  const {
    actionCreators,
    defaultState,
    reducer,
    thunkListenersDict,
  } = createStoreInternals({
    disableInternalSelectFnMemoize,
    initialState,
    injections,
    model,
    references,
  })

  const dispatchThunkListeners = (name, payload) => {
    const listensForAction = thunkListenersDict[name]
    return listensForAction && listensForAction.length > 0
      ? Promise.all(
          listensForAction.map(listenForAction =>
            listenForAction(
              get(listenForAction[metaSymbol].parent, actionCreators),
              payload,
              {
                dispatch: references.dispatch,
                getState: references.getState,
                injections,
                meta: listenForAction[metaSymbol],
              },
            ),
          ),
        )
      : Promise.resolve()
  }

  const dispatchActionStringListeners = () => next => action => {
    if (thunkListenersDict[action.type]) {
      dispatchThunkListeners(action.type, action.payload)
    }
    return next(action)
  }

  const store = reduxCreateStore(
    reducerEnhancer(reducer),
    defaultState,
    composeEnhancers(
      applyMiddleware(
        reduxThunk,
        dispatchActionStringListeners,
        mockActionsMiddlware,
        ...middleware,
      ),
    ),
  )

  store.getMockedActions = () => [...mockedActions]
  store.clearMockedActions = () => {
    mockedActions = []
  }

  store.addModel = (key, model) => {
    return store
  }

  // attach the action creators to dispatch
  Object.keys(actionCreators).forEach(key => {
    store.dispatch[key] = actionCreators[key]
  })

  references.dispatch = store.dispatch
  references.getState = store.getState
  references.getState.getState = store.getState

  return store
}
