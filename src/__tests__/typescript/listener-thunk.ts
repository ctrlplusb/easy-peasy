import { Action, Thunk, ListenerThunk, listenerThunk } from 'easy-peasy';

interface Model {
  log: Action<Model, string>;
  doAction: Action<Model, string>;
  doThunk: Thunk<Model, string>;
  doActionInvalid: Action<Model, number>;
  doThunkInvalid: Thunk<Model, number>;
}

const listenAction: ListenerThunk<Model, string> = listenerThunk(
  (actions, target) => {
    actions.log(target.payload);
  },
  actions => actions.doAction,
);

const listenActionInvalidThunk: ListenerThunk<Model, string> = listenerThunk(
  (actions, target) => {
    actions.log(target.payload);
  },
  // typings:expect-error
  actions => actions.doActionInvalid,
);

const listenThunk: ListenerThunk<Model, string> = listenerThunk(
  (actions, target) => {
    actions.log(target.payload);
  },
  actions => actions.doThunk,
);

const listenThunkInvalidPaylod: ListenerThunk<Model, string> = listenerThunk(
  (actions, target) => {
    actions.log(target.payload);
  },
  // typings:expect-error
  actions => actions.doThunkInvalid,
);

const listenString: ListenerThunk<Model, string> = listenerThunk(
  (actions, target) => {
    actions.log(target.payload);
  },
  () => 'ADD_TODO',
);

const listenInvalid: ListenerThunk<Model, string> = listenerThunk(
  (actions, target) => {
    actions.log(target.payload);
  },
  // typings:expect-error
  () => 1,
);

const listenInvalidFunc: ListenerThunk<Model, string> = listenerThunk(
  (actions, target) => {
    actions.log(target.payload);
  },
  // typings:expect-error
  () => undefined,
);

const multiListenAction: ListenerThunk<Model, string> = listenerThunk(
  (actions, target) => {
    actions.log(target.payload);
  },
  actions => [
    actions.doAction.type,
    actions.doThunk.type,
    actions.doThunk.startedType,
    actions.doThunk.succeededType,
    actions.doThunk.failedType,
  ],
);

const multiListenActionInvalidThunk: ListenerThunk<
  Model,
  string
> = listenerThunk(
  (actions, target) => {
    actions.log(target.payload);
  },
  // typings:expect-error
  actions => [actions.doAction, actions.doThunkInvalid],
);

const multiListeningActionString: ListenerThunk<Model, string> = listenerThunk(
  (actions, target) => {
    actions.log(target.payload);
  },
  () => ['foo', 'bar'],
);

const listeningActionString: ListenerThunk<Model, string> = listenerThunk(
  (actions, target) => {
    actions.log(target.payload);
  },
  () => 'foo',
);
