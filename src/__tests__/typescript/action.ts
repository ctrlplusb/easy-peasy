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

interface ListeningModel {
  logs: string[];
}

interface TargetModel {
  doAction: Action<TargetModel, string>;
  doThunk: Thunk<TargetModel, string>;
  doActionInvalid: Action<TargetModel, number>;
  doThunkInvalid: Thunk<TargetModel, number>;
}

// @ts-ignore
const targetModel: TargetModel = {};

const listeningAction: Action<ListeningModel, string> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  {
    listenTo: targetModel.doAction,
  },
);

const listeningActionInvalidPayload: Action<ListeningModel, string> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  // typings:expect-error
  {
    listenTo: targetModel.doActionInvalid,
  },
);

const listeningThunk: Action<ListeningModel, string> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  {
    listenTo: targetModel.doThunk,
  },
);

const listeningThunkInvalidPayload: Action<ListeningModel, string> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  // typings:expect-error
  {
    listenTo: targetModel.doThunkInvalid,
  },
);

const listeningString: Action<ListeningModel, string> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  {
    listenTo: 'ADD_TODO',
  },
);

const listeningInvalid: Action<ListeningModel, string> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  // typings:expect-error
  {
    listenTo: 1,
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
    listenTo: [targetModel.doAction, targetModel.doThunk],
  },
);

const multiListeningActionInvalid: Action<ListeningModel, string> = action(
  (state, payload) => {
    state.logs.push(payload);
  },
  // typings:expect-error
  {
    listenTo: [targetModel.doAction, targetModel.doThunkInvalid],
  },
);
