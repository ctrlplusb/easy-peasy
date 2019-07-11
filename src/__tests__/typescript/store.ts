import { createStore, Action, action, Thunk, thunk } from 'easy-peasy';

interface Model {
  count: number;
  doAction: Action<Model, boolean>;
  doThunk: Thunk<Model, number>;
}

const model: Model = {
  count: 0,
  doAction: action(() => {}),
  doThunk: thunk(() => {}),
};

const store = createStore(model);

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
