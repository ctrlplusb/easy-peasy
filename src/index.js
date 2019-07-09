import { setAutoFreeze } from 'immer-peasy';
import { useStoreActions, useStoreDispatch, useStoreState } from './hooks';
import createStore from './create-store';
import createContextStore from './create-context-store';
import createComponentStore from './create-component-store';
import StoreProvider from './provider';
import {
  action,
  computed,
  debug,
  memo,
  reducer,
  thunk,
  actionOn,
  thunkOn,
} from './helpers';

/**
 * The auto freeze feature of immer doesn't seem to work in our testing. We have
 * explicitly disabled it to avoid perf issues.
 */
setAutoFreeze(false);

export {
  action,
  computed,
  createContextStore,
  createComponentStore,
  createStore,
  debug,
  actionOn,
  thunkOn,
  memo,
  reducer,
  StoreProvider,
  thunk,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
};
