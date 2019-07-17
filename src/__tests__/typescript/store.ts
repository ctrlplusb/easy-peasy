import { createStore, Action, action, Thunk, thunk } from 'easy-peasy';

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

const store = createStore(model);

const configuredStore = createStore(model, {
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
