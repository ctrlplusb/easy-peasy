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
import createContextStore from './create-context-store';
import createComponentStore from './create-component-store';
import StoreProvider from './provider';
import {
  action,
  actionName,
  listen,
  reducer,
  select,
  selector,
  thunk,
  thunkCompleteName,
  thunkFailName,
  thunkStartName,
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
  createContextStore,
  createComponentStore,
  createStore,
  createTypedHooks,
  listen,
  reducer,
  select,
  selector,
  StoreProvider,
  thunk,
  thunkCompleteName,
  thunkFailName,
  thunkStartName,
  useActions,
  useDispatch,
  useStore,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
};
