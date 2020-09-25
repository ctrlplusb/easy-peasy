import { setAutoFreeze } from 'immer';
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
import createTransform from './create-transform';
import StoreProvider from './provider';
import useLocalStore from './use-local-store';
import {
  action,
  actionOn,
  computed,
  debug,
  generic,
  memo,
  persist,
  reducer,
  thunk,
  thunkOn,
  unstable_effectOn,
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
  createContextStore,
  createStore,
  createTransform,
  createTypedHooks,
  debug,
  generic,
  memo,
  persist,
  reducer,
  StoreProvider,
  thunk,
  thunkOn,
  unstable_effectOn,
  useLocalStore,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
  useStoreRehydrated,
  useStore,
};
