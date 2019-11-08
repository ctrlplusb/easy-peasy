import { setAutoFreeze } from 'immer-peasy';
import { shallowEqual } from './lib';
import {
  createTypedHooks,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
  useStoreRehydrated,
  useStore,
} from './hooks';
import createStore from './create-store';
import createContextStore from './create-context-store';
import createComponentStore from './create-component-store';
import createTransform from './create-transform';
import StoreProvider from './provider';
import {
  action,
  actionOn,
  computed,
  debug,
  memo,
  persist,
  reducer,
  thunk,
  thunkOn,
} from './helpers';

/**
 * The auto freeze feature of immer doesn't seem to work in our testing. We have
 * explicitly disabled it to avoid perf issues.
 */
setAutoFreeze(false);

export {
  action,
  actionOn,
  computed,
  createComponentStore,
  createContextStore,
  createStore,
  createTransform,
  createTypedHooks,
  debug,
  memo,
  persist,
  reducer,
  StoreProvider,
  thunk,
  thunkOn,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
  useStoreRehydrated,
  useStore,
  shallowEqual,
};
