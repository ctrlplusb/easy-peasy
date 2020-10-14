import {
  Action,
  action,
  createStore,
  ReduxAction,
  Thunk,
  thunk,
} from 'easy-peasy';
import { Reducer } from 'redux';

interface Model {
  count: number;
  doActionVoid: Action<Model>;
  doAction: Action<Model, boolean>;
  doThunk: Thunk<Model, number>;
}

const model: Model = {
  count: 0,
  doActionVoid: action(() => {}),
  doAction: action(() => {}),
  doThunk: thunk(() => {}),
};

interface PersistPartial {
  persist: string;
}

function persistReducer<S, A extends ReduxAction>(
  baseReducer: Reducer<S, A>,
): Reducer<S & PersistPartial, A> {
  return (baseReducer as unknown) as Reducer<S & PersistPartial, A>;
}

const store = createStore(model, {
  reducerEnhancer: (reducer) => persistReducer(reducer),
});

const configuredStore = createStore(model, {
  disableImmer: false,
  devTools: false,
  initialState: { foo: 'bar' },
  injections: { foo: 'bar' },
  mockActions: true,
  name: 'bob',
  version: 1,
  reducerEnhancer: (reducer) => reducer,
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

store.persist.clear().then(() => undefined);
store.persist.flush().then(() => undefined);
store.persist.resolveRehydration().then(() => undefined);

// typings:expect-error
store.addModel();
// typings:expect-error
store.addModel('bar');
// typings:expect-error
store.addModel('bar', true);

const addModelResult = store.addModel('foo', {});
addModelResult.resolveRehydration().then(() => undefined);
