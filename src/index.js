import { setAutoFreeze } from 'immer-peasy';
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
  computed,
  debug,
  listen,
  memo,
  reducer,
  select,
  selector,
  thunk,
  thunkCompleteName,
  thunkFailName,
  thunkStartName,
} from './helpers';

/**
 * The auto freeze feature of immer doesn't seem to work in our testing. We have
 * explicitly disabled it to avoid perf issues.
 */
setAutoFreeze(false);

export {
  action,
  actionName,
  computed,
  createContextStore,
  createComponentStore,
  createStore,
  createTypedHooks,
  debug,
  listen,
  memo,
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
