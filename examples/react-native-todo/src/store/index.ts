import {createStore, createTypedHooks} from 'easy-peasy';
import todosStore, {TodosModel} from './model';

const store = createStore<TodosModel>(todosStore);

const typedHooks = createTypedHooks<TodosModel>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;

export default store;
