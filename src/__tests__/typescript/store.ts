import {
  createStore,
  Action,
  action,
  Thunk,
  thunk,
  Model,
  model,
  ReduxAction,
} from 'easy-peasy';
import { Reducer } from 'redux';

type StoreModel = Model<{
  count: number;
  doActionVoid: Action<StoreModel>;
  doAction: Action<StoreModel, boolean>;
  doThunk: Thunk<StoreModel, number>;
}>;

const storeModel = model<StoreModel>({
  count: 0,
  doActionVoid: action(() => {}),
  doAction: action(() => {}),
  doThunk: thunk(() => {}),
});

interface PersistPartial {
  persist: string;
}

function persistReducer<S, A extends ReduxAction>(
  baseReducer: Reducer<S, A>,
): Reducer<S & PersistPartial, A> {
  return (baseReducer as unknown) as Reducer<S & PersistPartial, A>;
}

const store = createStore(storeModel, {
  reducerEnhancer: reducer => persistReducer(reducer),
});

const configuredStore = createStore(storeModel, {
  disableImmer: false,
  devTools: false,
  initialState: { foo: 'bar' },
  injections: { foo: 'bar' },
  mockActions: true,
  name: 'bob',
  reducerEnhancer: reducer => reducer,
});

store.getActions().doActionVoid();

store.getActions().doAction(true);
store.dispatch.doAction(true);

// typings:expect-error
store.getActions().doAction(1);
// typings:expect-error
store.dispatch.doAction(1);

store.getActions().doThunk(1);
store.dispatch.doThunk(1);

// typings:expect-error
store.getActions().doThunk(true);
// typings:expect-error
store.dispatch.doThunk(true);

store.getMockedActions()[0].type;

store.clearMockedActions();
