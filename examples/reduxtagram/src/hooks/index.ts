import { createTypedHooks } from 'easy-peasy';
import { StoreModel } from '@/model';

const { useStoreActions, useStoreDispatch, useStoreState, useStore } = createTypedHooks<StoreModel>();

export { useStoreActions, useStoreDispatch, useStoreState, useStore };
