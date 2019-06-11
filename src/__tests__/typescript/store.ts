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
  count: number;
  listeners: Listen<Model>;
  doAction: Action<Model, boolean>;
  doThunk: Thunk<Model, number>;
}

const model: Model = {
  count: 0,
  listeners: listen(() => {}),
  doAction: action(() => {}),
  doThunk: thunk(() => {}),
};

const store = createStore(model);

const doAction = store.useStoreActions(actions => actions.doAction);
doAction(true);

const dispatch = store.useStoreDispatch();
dispatch({ type: 'FOO' });

const count = store.useStoreState(state => state.count);
count + 10;

store.dispatch.doAction(true);
store.getActions().doAction(true);

// typings:expect-error
store.dispatch.doAction(1);
// typings:expect-error
store.getActions().doAction(1);

store.dispatch.doThunk(1);
store.getActions().doThunk(1);

// typings:expect-error
store.dispatch.doThunk(true);
// typings:expect-error
store.getActions().doThunk(true);

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
