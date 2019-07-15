import { action, Action, Thunk, ThunkOn, thunkOn } from 'easy-peasy';

interface Model {
  log: Action<Model, string>;
  doActionString: Action<Model, string>;
  doThunkString: Thunk<Model, string>;
  doActionNumber: Action<Model, number>;
  doThunkNumber: Thunk<Model, number>;
}

const valid1: ThunkOn<Model, string> = thunkOn(
  actions => actions.doActionString,
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

const invalid1: ThunkOn<Model, string> = thunkOn(
  actions => actions.doActionNumber,
  (actions, target) => {
    // typings:expect-error
    actions.log(target.payload);
  },
);

const listenThunk: ThunkOn<Model, string> = thunkOn(
  actions => actions.doThunkString,
  (actions, target) => {
    actions.log(target.payload);
  },
);

const listenThunkInvalidPaylod: ThunkOn<Model, string> = thunkOn(
  actions => actions.doThunkNumber,
  (actions, target) => {
    // typings:expect-error
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
    actions.doActionString.type,
    actions.doThunkString.type,
    actions.doThunkString.startType,
    actions.doThunkString.successType,
    actions.doThunkString.failType,
  ],
  (actions, target) => {
    actions.log(target.payload);
  },
);

const multiListenActionInvalidThunk: ThunkOn<Model, boolean> = thunkOn(
  actions => [actions.doActionString, actions.doThunkNumber],
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

// #region multiple listeners with different payload types

interface User {
  firstName: string;
  lastName: string;
}

export interface SessionModel {
  user?: User;
  register: Action<SessionModel, User>;
  unregister: Action<SessionModel>;
  sessionListeners: ThunkOn<SessionModel, boolean>;
}

const sessionModel: SessionModel = {
  user: undefined,
  register: action((state, payload) => {
    state.user = payload;
  }),
  unregister: action(state => {
    state.user = undefined;
  }),
  sessionListeners: thunkOn(
    actions => [actions.register, actions.unregister],
    (actions, target) => {
      const { payload } = target;
    },
  ),
};

export default sessionModel;

// #endregion
