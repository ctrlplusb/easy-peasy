import { Action, Thunk, ThunkOn, thunkOn } from 'easy-peasy';

interface Model {
  log: Action<Model, string>;
  doAction: Action<Model, string>;
  doThunk: Thunk<Model, string>;
  doActionInvalid: Action<Model, number>;
  doThunkInvalid: Thunk<Model, number>;
}

const listenAction: ThunkOn<Model, string> = thunkOn(
  (actions, target, { targets }) => {
    const [foo] = targets;
    foo + 'bar';
    target.type + 'foo';
    target.name + 'foo';
    if (target.error != null) {
      target.error.stack;
    }
    actions.log(target.payload);
  },
  actions => actions.doAction,
);

const listenActionInvalidThunk: ThunkOn<Model, string> = thunkOn(
  (actions, target) => {
    actions.log(target.payload);
  },
  // typings:expect-error
  actions => actions.doActionInvalid,
);

const listenThunk: ThunkOn<Model, string> = thunkOn(
  (actions, target) => {
    actions.log(target.payload);
  },
  actions => actions.doThunk,
);

const listenThunkInvalidPaylod: ThunkOn<Model, string> = thunkOn(
  (actions, target) => {
    actions.log(target.payload);
  },
  // typings:expect-error
  actions => actions.doThunkInvalid,
);

const listenString: ThunkOn<Model, string> = thunkOn(
  (actions, target) => {
    actions.log(target.payload);
  },
  () => 'ADD_TODO',
);

const listenInvalid: ThunkOn<Model, string> = thunkOn(
  (actions, target) => {
    actions.log(target.payload);
  },
  // typings:expect-error
  () => 1,
);

const listenInvalidFunc: ThunkOn<Model, string> = thunkOn(
  (actions, target) => {
    actions.log(target.payload);
  },
  // typings:expect-error
  () => undefined,
);

const multiListenAction: ThunkOn<Model, string> = thunkOn(
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

const multiListenActionInvalidThunk: ThunkOn<Model, string> = thunkOn(
  (actions, target) => {
    actions.log(target.payload);
  },
  // typings:expect-error
  actions => [actions.doAction, actions.doThunkInvalid],
);

const multiListeningActionString: ThunkOn<Model, string> = thunkOn(
  (actions, target) => {
    actions.log(target.payload);
  },
  () => ['foo', 'bar'],
);

const listeningActionString: ThunkOn<Model, string> = thunkOn(
  (actions, target) => {
    actions.log(target.payload);
  },
  () => 'foo',
);
