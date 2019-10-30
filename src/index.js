import { setAutoFreeze } from 'immer-peasy';
import {
  createTypedHooks,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
  useStore,
} from './hooks';
import createStore from './create-store';
import createContextStore from './create-context-store';
import createComponentStore from './create-component-store';
import StoreProvider from './provider';
import RehydrateBoundary from './rehydrate-boundary';
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
  createTypedHooks,
  debug,
  memo,
  persist,
  reducer,
  RehydrateBoundary,
  StoreProvider,
  thunk,
  thunkOn,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
  useStore,
};
