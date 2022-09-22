// React 18 requires the use of the useSyncExternalStore hook for external
// stores to hook into its concurrent features. We want to continue supporting
// older versions of React (16/17), so we are utilsing a shim provided by the
// React team which will ensure backwards compatibility;
// eslint-disable-next-line import/no-unresolved
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector';

import { initializeUseStoreState } from './hooks';

initializeUseStoreState(useSyncExternalStoreWithSelector);

export * from './hooks';
export * from './create-store';
export * from './create-context-store';
export * from './create-transform';
export * from './provider';
export * from './use-local-store';
export * from './helpers';
