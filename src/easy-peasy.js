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

const actionNameSymbol = '__actionName__'
const effectSymbol = '__effect__'
const thunkSymbol = '__thunk__'
const listenersSymbol = '__listeners__'
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

const startsWith = (target, search) =>
  target.substr(0, search.length) === search

let notifiedAboutEffectDeprecation = false

export const actionName = action => action[actionNameSymbol]

export const thunkStartName = action => `${action[actionNameSymbol]}(started)`

export const thunkCompleteName = action =>
  `${action[actionNameSymbol]}(completed)`

export const effect = fn => {
  if (!notifiedAboutEffectDeprecation) {
    notifiedAboutEffectDeprecation = true
    // eslint-disable-next-line no-console
    console.warn(
      'Easy Peasy: warning we have deprecated the "effect" helper. It will be removed in the next major release. We recommend that you migrate to the "thunk" helper, which satisfies the same responsibilities.',
    )
  }
  fn[effectSymbol] = true
  return fn
}

export const thunk = fn => {
  fn[thunkSymbol] = true
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

let notifiedAboutListenersDeprecation = false

export const listeners = fn => {
  if (!notifiedAboutListenersDeprecation) {
    notifiedAboutListenersDeprecation = true
    // eslint-disable-next-line no-console
    console.warn(
      'Easy Peasy: warning we have deprecated the "listeners" helper. It will be removed in the next major release. We recommend that you migrate to the "listen" helper, which satisfies the same responsibilities.',
    )
  }
  fn[listenersSymbol] = true
  return fn
}

export const listen = fn => {
  fn[listenSymbol] = true
  return fn
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

  const wrapFnWithMemoize = x =>
    !disableInternalSelectFnMemoize && typeof x === 'function'
      ? memoizerific(maxSelectFnMemoize)(x)
      : x

  const definition = {
    ...model,
    logFullState: thunk((actions, payload, { getState }) => {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(getState(), null, 2))
    }),
  }

  const references = {}
  const defaultState = {}
  const actionThunks = {}
  const actionCreators = {}
  const actionCreatorDict = {}
  const actionReducers = {}
  const customReducers = []
  const selectorReducers = []
  const listenerDefinitions = []
  const listenerDict = {}
  const listenDefinitions = []
  const listenDict = {}
  const listenStringDict = {}

  const dispatchListenersForAction = (name, payload) => {
    const listenersForAction = listenerDict[name]
    const listensForAction = [
      ...(listenDict[name] || []),
      ...(listenStringDict[name] || []),
    ]
    return Promise.all([
      listenersForAction && listenersForAction.length > 0
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
        : Promise.resolve(),
      listensForAction && listensForAction.length > 0
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
        : Promise.resolve(),
    ])
  }

  const extract = (current, parentPath) =>
    Object.keys(current).forEach(key => {
      const value = current[key]
      const path = [...parentPath, key]
      const meta = {
        parent: parentPath,
        path,
      }
      if (typeof value === 'function') {
        if (value[selectSymbol]) {
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
                dispatchListenersForAction(
                  actionCreator[actionNameSymbol],
                  payload,
                )
                return result
              })
          actionCreator[actionNameSymbol] = name
          actionCreatorDict[name] = actionCreator
          set(path, actionCreators, actionCreator)
        } else if (value[effectSymbol]) {
          const name = `@effect.${path.join('.')}`
          value[actionNameSymbol] = name

          // Effect Action
          const action = payload => {
            if (devTools) {
              references.dispatch({
                type: name,
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
          actionCreator[actionNameSymbol] = name
          actionCreatorDict[name] = actionCreator
          set(path, actionCreators, actionCreator)
        } else if (value[reducerSymbol]) {
          customReducers.push({ path, reducer: value })
        } else if (value[listenersSymbol]) {
          listenerDefinitions.push(value)
        } else if (value[listenSymbol]) {
          listenDefinitions.push(value)
          value[metaSymbol] = meta
        } else {
          const name = `@action.${path.join('.')}`
          value[actionNameSymbol] = name

          // Reducer Action
          const action = (state, payload) =>
            produce(state, draft =>
              value(draft, payload, {
                dispatch: references.dispatch,
                dispatchLocal: get(path, references.dispatch),
                getState: references.getState,
              }),
            )
          action.actionName = name
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
          actionCreator[actionNameSymbol] = name
          actionCreatorDict[name] = actionCreator
          set(path, actionCreators, actionCreator)
        }
      } else if (isStateObject(value) && Object.keys(value).length > 0) {
        set(path, defaultState, {})
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

  listenDefinitions.forEach(def => {
    const on = (action, thunkHandler) => {
      if (typeof thunkHandler !== 'function') {
        return
      }

      thunkHandler[metaSymbol] = def[metaSymbol]

      if (
        typeof action === 'function' &&
        action[actionNameSymbol] &&
        actionCreatorDict[action[actionNameSymbol]]
      ) {
        listenDict[action[actionNameSymbol]] =
          listenDict[action[actionNameSymbol]] || []
        listenDict[action[actionNameSymbol]].push(thunkHandler)
      } else if (typeof action === 'string') {
        listenStringDict[action] = listenStringDict[action] || []
        listenStringDict[action].push(thunkHandler)
      }
    }
    def(on)
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

  const dispatchActionStringListeners = () => next => action => {
    if (listenStringDict[action.type]) {
      dispatchListenersForAction(action.type, action.payload)
    }
    return next(action)
  }

  let mockedActions = []

  const mockActionsMiddlware = () => next => action => {
    if (mockActions) {
      mockedActions.push(action)
      return undefined
    }
    return next(action)
  }

  const store = reduxCreateStore(
    reducerEnhancer(reducers),
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

  // attach the action creators to dispatch
  Object.keys(actionCreators).forEach(key => {
    store.dispatch[key] = actionCreators[key]
  })

  references.dispatch = store.dispatch
  references.getState = store.getState
  references.getState.getState = store.getState

  return store
}
