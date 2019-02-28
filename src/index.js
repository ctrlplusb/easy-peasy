import { setAutoFreeze } from 'immer'
import { createTypedHooks, useStore, useActions, useDispatch } from './hooks'
import createStore from './create-store'
import StoreProvider from './provider'
import {
  action,
  actionName,
  listen,
  reducer,
  select,
  thunk,
  thunkStartName,
  thunkCompleteName,
} from './helpers'

/**
 * immer is an implementation detail, so we are not going to use its auto freeze
 * behaviour, which throws errors if trying to mutate state. It's also risky
 * for production builds as has a perf overhead.
 *
 * @see https://github.com/mweststrate/immer#auto-freezing
 */
setAutoFreeze(false)

export {
  action,
  actionName,
  createStore,
  createTypedHooks,
  listen,
  reducer,
  select,
  StoreProvider,
  thunk,
  thunkStartName,
  thunkCompleteName,
  useActions,
  useDispatch,
  useStore,
}
