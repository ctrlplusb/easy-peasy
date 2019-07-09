import { listenerAction, ListenerAction, Action, Thunk } from 'easy-peasy';

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

interface StoreModel {
  listening: ListeningModel;
  other: OtherModel;
}

const listeningAction: ListenerAction<
  ListeningModel,
  string,
  StoreModel
> = listenerAction(
  (state, target) => {
    target.type + 'foo';
    target.name + 'foo';
    if (target.error != null) {
      target.error.stack;
    }
    state.logs.push(target.payload);
  },
  actions => actions.doAction,
);

const listeningActionInvalidPayload: ListenerAction<
  ListeningModel,
  string
> = listenerAction(
  (state, target) => {
    state.logs.push(target.payload);
  },
  // typings:expect-error
  actions => actions.doActionInvalid,
);

const listeningThunk: ListenerAction<ListeningModel, string> = listenerAction(
  (state, target) => {
    state.logs.push(target.payload);
  },
  actions => actions.doThunk,
);

const listeningThunkInvalidPayload: ListenerAction<
  ListeningModel,
  string
> = listenerAction(
  (state, target) => {
    state.logs.push(target.payload);
  },
  // typings:expect-error
  actions => actions.doThunkInvalid,
);

const listeningString: ListenerAction<ListeningModel, string> = listenerAction(
  (state, target) => {
    state.logs.push(target.payload);
  },
  () => 'ADD_TODO',
);

const listeningInvalid: ListenerAction<ListeningModel, string> = listenerAction(
  (state, target) => {
    state.logs.push(target.payload);
  },
  // typings:expect-error
  () => 1,
);

const listeningInvalidFunc: ListenerAction<
  ListeningModel,
  string
> = listenerAction(
  (state, target) => {
    state.logs.push(target.payload);
  },
  // typings:expect-error
  () => undefined,
);

const multiListeningAction: ListenerAction<
  ListeningModel,
  string
> = listenerAction(
  (state, target) => {
    state.logs.push(target.payload);
  },
  actions => [actions.doAction, actions.doThunk],
);

const multiListeningActionInvalid: ListenerAction<
  ListeningModel,
  string
> = listenerAction(
  (state, target) => {
    state.logs.push(target.payload);
  },
  // typings:expect-error
  actions => [actions.doAction, actions.doThunkInvalid],
);

const multiListeningActionString: ListenerAction<
  ListeningModel,
  string
> = listenerAction(
  (state, target) => {
    state.logs.push(target.payload);
  },
  () => ['foo', 'bar'],
);

const listeningActionString: ListenerAction<
  ListeningModel,
  string
> = listenerAction(
  (state, target) => {
    state.logs.push(target.payload);
  },
  () => 'foo',
);
