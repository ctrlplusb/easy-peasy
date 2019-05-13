import {
  createStore,
  Listen,
  listen,
  Action,
  action,
  Thunk,
  thunk,
} from 'easy-peasy';

interface Model {
  listeners: Listen<Model>;
  doAction: Action<Model, boolean>;
  doThunk: Thunk<Model, number>;
}

const model: Model = {
  listeners: listen(() => {}),
  doAction: action(() => {}),
  doThunk: thunk(() => {}),
};

const store = createStore(model);

store.dispatch.doAction(true);

// typings:expect-error
store.dispatch.doAction(1);

store.dispatch.doThunk(1);

// typings:expect-error
store.dispatch.doThunk(true);

store.getMockedActions()[0].type;

store.clearMockedActions();

// typings:expect-error
store.triggerListener('foo', 'ACTION_NAME', 'payload');

// typings:expect-error
store.triggerListener(model.listeners, true, 'payload');

store.triggerListener(model.listeners, 'ACTION_NAME', 'payload');

// typings:expect-error
store.triggerListener(model.listeners, model.doAction, 'payload');

// typings:expect-error
store.triggerListener(model.listeners, model.doAction);

store.triggerListener(model.listeners, model.doAction, true);

// typings:expect-error
store.triggerListener(model.listeners, model.doThunk, 'payload');

// typings:expect-error
store.triggerListener(model.listeners, model.doThunk);

store.triggerListener(model.listeners, model.doThunk, 1);

// typings:expect-error
store.triggerListeners(true, 'payload');

store.triggerListeners('ACTION_NAME', 'payload');

// typings:expect-error
store.triggerListeners(model.doAction, 'payload');

// typings:expect-error
store.triggerListeners(model.doAction);

store.triggerListeners(model.doAction, true);

// typings:expect-error
store.triggerListeners(model.doThunk, 'payload');

// typings:expect-error
store.triggerListeners(model.doThunk);

store.triggerListeners(model.doThunk, 1);
