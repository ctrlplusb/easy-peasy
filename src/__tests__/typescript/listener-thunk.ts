import { action, Action, Thunk, ThunkOn, thunkOn } from 'easy-peasy';

interface Model {
  log: Action<Model, string>;
  doActionString: Action<Model, string>;
  doThunkString: Thunk<Model, string>;
  doActionNumber: Action<Model, number>;
  doThunkNumber: Thunk<Model, number>;
}

const valid1: ThunkOn<Model> = thunkOn(
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

const invalid1: ThunkOn<Model> = thunkOn(
  actions => actions.doActionNumber,
  (actions, target) => {
    // typings:expect-error
    actions.log(target.payload);
  },
);

const valid2: ThunkOn<Model> = thunkOn(
  actions => actions.doThunkString,
  (actions, target) => {
    actions.log(target.payload);
  },
);

const invalid2: ThunkOn<Model> = thunkOn(
  actions => actions.doThunkNumber,
  (actions, target) => {
    // typings:expect-error
    actions.log(target.payload);
  },
);

const valid3: ThunkOn<Model> = thunkOn(
  () => 'ADD_TODO',
  (actions, target) => {
    actions.log(target.payload);
  },
);

const invalid3: ThunkOn<Model> = thunkOn(
  // typings:expect-error
  () => 1,
  // typings:expect-error
  (actions, target) => {
    actions.log(target.payload);
  },
);

const invalid4: ThunkOn<Model> = thunkOn(
  // typings:expect-error
  () => undefined,
  // typings:expect-error
  (actions, target) => {
    actions.log(target.payload);
  },
);

const valid4: ThunkOn<Model> = thunkOn(
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

const invalid5: ThunkOn<Model> = thunkOn(
  actions => [actions.doActionString, actions.doThunkNumber],
  (actions, target) => {
    // typings:expect-error
    actions.log(target.payload);
  },
);

const valid5: ThunkOn<Model> = thunkOn(
  actions => [actions.doActionString, actions.doThunkNumber],
  (actions, target) => {
    if (typeof target.payload === 'number') {
    } else {
      actions.log(target.payload);
    }
  },
);

const valid6: ThunkOn<Model> = thunkOn(
  () => ['foo', 'bar'],
  (actions, target) => {
    actions.log(target.payload);
  },
);

const valid7: ThunkOn<Model> = thunkOn(
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

interface SessionModel {
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
      if (payload == null) {
      } else {
        payload.firstName + payload.lastName;
      }
    },
  ),
};

// #endregion
