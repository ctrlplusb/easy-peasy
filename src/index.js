import { setAutoFreeze } from 'immer';
import {
  createTypedHooks,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
  useStoreRehydrated,
  useStore,
} from './react/hooks';
import createStore from './create-store';
import createContextStore from './react/create-context-store';
import createComponentStore from './react/create-component-store';
import createTransform from './plugins/persist/create-transform';
import StoreProvider from './react/provider';
import {
  action,
  actionOn,
  computed,
  debug,
  memo,
  model,
  reducer,
  thunk,
  thunkOn,
} from './helpers';
import { registerPlugins } from './plugins';
import persistPlugin from './plugins/persist/index';
import computedPlugin from './plugins/computed/index';

registerPlugins([persistPlugin, computedPlugin]);

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
  model,
  reducer,
  registerPlugins,
  StoreProvider,
  thunk,
  thunkOn,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
  useStoreRehydrated,
  useStore,
};
