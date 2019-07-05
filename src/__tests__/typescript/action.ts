/* eslint-disable */

import { createStore, action, Action, Thunk, thunk } from 'easy-peasy';

interface TodosModel {
  items: string[];
  add: Action<TodosModel, string>;
  clear: Action<TodosModel>;
}

interface Model {
  todos: TodosModel;
}

const todos: TodosModel = {
  items: [],
  add: action((state, payload) => {
    state.items.push(payload);
  }),
  clear: action(state => {
    state.items = [];
  }),
};

const model: Model = {
  todos,
};

const store = createStore(model);

store.dispatch.todos.add('foo');
// typings:expect-error
store.dispatch.todos.add(1);
// typings:expect-error
store.dispatch.todos.add();

store.dispatch.todos.clear();

interface ListeningModel {
  logs: string[];
  doAction: Action<ListeningModel, string>;
  doThunk: Thunk<ListeningModel, string>;
  doActionInvalid: Action<ListeningModel, number>;
  doThunkInvalid: Thunk<ListeningModel, number>;
}

interface OtherModel {
  otherAction: Action<OtherModel, string>;
  otherThunk: Thunk<OtherModel, string>;
}

interface StoreListenerModel {
  listening: ListeningModel;
  other: OtherModel;
}

const listeningAction: Action<
  ListeningModel,
  string,
  StoreListenerModel
> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  {
    listenTo: actions => actions.doAction,
  },
);

const listeningActionInvalidPayload: Action<ListeningModel, string> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  // typings:expect-error
  {
    listenTo: actions => actions.doActionInvalid,
  },
);

const listeningThunk: Action<ListeningModel, string> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  {
    listenTo: actions => actions.doThunk,
  },
);

const listeningThunkInvalidPayload: Action<ListeningModel, string> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  // typings:expect-error
  {
    listenTo: actions => actions.doThunkInvalid,
  },
);

const listeningString: Action<ListeningModel, string> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  {
    listenTo: () => 'ADD_TODO',
  },
);

const listeningInvalid: Action<ListeningModel, string> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  // typings:expect-error
  {
    listenTo: () => 1,
  },
);

const listeningInvalidFunc: Action<ListeningModel, string> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  // typings:expect-error
  {
    listenTo: () => undefined,
  },
);

const multiListeningAction: Action<ListeningModel, string> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  {
    listenTo: actions => [actions.doAction, actions.doThunk],
  },
);

const multiListeningActionInvalid: Action<ListeningModel, string> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  // typings:expect-error
  {
    listenTo: actions => [actions.doAction, actions.doThunkInvalid],
  },
);

const multiListeningActionString: Action<ListeningModel, string> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  {
    listenTo: () => ['foo', 'bar'],
  },
);

const listeningActionString: Action<ListeningModel, string> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  {
    listenTo: () => 'foo',
  },
);
