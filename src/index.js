import { setAutoFreeze } from 'immer';
import {
  createTypedHooks,
  useActions,
  useDispatch,
  useStore,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
} from './hooks';
import createStore from './create-store';
import StoreProvider from './provider';
import {
  action,
  actionName,
  derived,
  listen,
  reducer,
  select,
  thunk,
  thunkStartName,
  thunkCompleteName,
  thunkFailName,
} from './helpers';

/**
 * immer is an implementation detail, so we are not going to use its auto freeze
 * behaviour, which throws errors if trying to mutate state. It's also risky
 * for production builds as has a perf overhead.
 *
 * @see https://github.com/mweststrate/immer#auto-freezing
 */
setAutoFreeze(false);

export {
  action,
  actionName,
  createStore,
  createTypedHooks,
  derived,
  listen,
  reducer,
  select,
  StoreProvider,
  thunk,
  thunkStartName,
  thunkCompleteName,
  thunkFailName,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
  useActions,
  useDispatch,
  useStore,
};
