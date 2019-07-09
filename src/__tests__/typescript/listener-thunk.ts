import { Action, Thunk, ThunkOn, thunkOn } from 'easy-peasy';

interface Model {
  log: Action<Model, string>;
  doAction: Action<Model, string>;
  doThunk: Thunk<Model, string>;
  doActionInvalid: Action<Model, number>;
  doThunkInvalid: Thunk<Model, number>;
}

const listenAction: ThunkOn<Model, string> = thunkOn(
  actions => actions.doAction,
  (actions, target) => {
    const [foo] = target.resolvedTargets;
    foo + 'bar';
    target.type + 'foo';
    if (target.error != null) {
      target.error.stack;
    }
    actions.log(target.payload);
  },
);

const listenActionInvalidThunk: ThunkOn<Model, string> = thunkOn(
  // typings:expect-error
  actions => actions.doActionInvalid,
  (actions, target) => {
    actions.log(target.payload);
  },
);

const listenThunk: ThunkOn<Model, string> = thunkOn(
  actions => actions.doThunk,
  (actions, target) => {
    actions.log(target.payload);
  },
);

const listenThunkInvalidPaylod: ThunkOn<Model, string> = thunkOn(
  // typings:expect-error
  actions => actions.doThunkInvalid,
  (actions, target) => {
    actions.log(target.payload);
  },
);

const listenString: ThunkOn<Model, string> = thunkOn(
  () => 'ADD_TODO',
  (actions, target) => {
    actions.log(target.payload);
  },
);

const listenInvalid: ThunkOn<Model, string> = thunkOn(
  // typings:expect-error
  () => 1,
  // typings:expect-error
  (actions, target) => {
    actions.log(target.payload);
  },
);

const listenInvalidFunc: ThunkOn<Model, string> = thunkOn(
  // typings:expect-error
  () => undefined,
  // typings:expect-error
  (actions, target) => {
    actions.log(target.payload);
  },
);

const multiListenAction: ThunkOn<Model, string> = thunkOn(
  actions => [
    actions.doAction.type,
    actions.doThunk.type,
    actions.doThunk.startType,
    actions.doThunk.successType,
    actions.doThunk.failType,
  ],
  (actions, target) => {
    actions.log(target.payload);
  },
);

const multiListenActionInvalidThunk: ThunkOn<Model, string> = thunkOn(
  // typings:expect-error
  actions => [actions.doAction, actions.doThunkInvalid],
  (actions, target) => {
    actions.log(target.payload);
  },
);

const multiListeningActionString: ThunkOn<Model, string> = thunkOn(
  () => ['foo', 'bar'],
  (actions, target) => {
    actions.log(target.payload);
  },
);

const listeningActionString: ThunkOn<Model, string> = thunkOn(
  () => 'foo',
  (actions, target) => {
    actions.log(target.payload);
  },
);
