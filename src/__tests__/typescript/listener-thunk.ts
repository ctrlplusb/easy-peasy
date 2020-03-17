import {
  action,
  Action,
  Thunk,
  ThunkOn,
  thunkOn,
  Model,
  model,
} from 'easy-peasy';

type StoreModel = Model<{
  log: Action<StoreModel, string>;
  doActionString: Action<StoreModel, string>;
  doThunkString: Thunk<StoreModel, string>;
  doActionNumber: Action<StoreModel, number>;
  doThunkNumber: Thunk<StoreModel, number>;
}>;

const valid1: ThunkOn<StoreModel> = thunkOn(
  actions => actions.doActionString,
  (actions, target) => {
    const [foo] = target.resolvedTargets;
    `${foo  }bar`;
    `${target.type  }foo`;
    if (target.error != null) {
      target.error.stack;
    }
    actions.log(target.payload);
  },
);

const invalid1: ThunkOn<StoreModel> = thunkOn(
  actions => actions.doActionNumber,
  (actions, target) => {
    // typings:expect-error
    actions.log(target.payload);
  },
);

const valid2: ThunkOn<StoreModel> = thunkOn(
  actions => actions.doThunkString,
  (actions, target) => {
    actions.log(target.payload);
  },
);

const invalid2: ThunkOn<StoreModel> = thunkOn(
  actions => actions.doThunkNumber,
  (actions, target) => {
    // typings:expect-error
    actions.log(target.payload);
  },
);

const valid3: ThunkOn<StoreModel> = thunkOn(
  () => 'ADD_TODO',
  (actions, target) => {
    actions.log(target.payload);
  },
);

const invalid3: ThunkOn<StoreModel> = thunkOn(
  // typings:expect-error
  () => 1,
  // typings:expect-error
  (actions, target) => {
    actions.log(target.payload);
  },
);

const invalid4: ThunkOn<StoreModel> = thunkOn(
  // typings:expect-error
  () => undefined,
  // typings:expect-error
  (actions, target) => {
    actions.log(target.payload);
  },
);

const valid4: ThunkOn<StoreModel> = thunkOn(
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

const invalid5: ThunkOn<StoreModel> = thunkOn(
  actions => [actions.doActionString, actions.doThunkNumber],
  (actions, target) => {
    // typings:expect-error
    actions.log(target.payload);
  },
);

const valid5: ThunkOn<StoreModel> = thunkOn(
  actions => [actions.doActionString, actions.doThunkNumber],
  (actions, target) => {
    if (typeof target.payload === 'number') {
    } else {
      actions.log(target.payload);
    }
  },
);

const valid6: ThunkOn<StoreModel> = thunkOn(
  () => ['foo', 'bar'],
  (actions, target) => {
    actions.log(target.payload);
  },
);

const valid7: ThunkOn<StoreModel> = thunkOn(
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

type SessionModel = Model<{
  user?: User;
  register: Action<SessionModel, User>;
  unregister: Action<SessionModel>;
  sessionListeners: ThunkOn<SessionModel, boolean>;
}>;

const sessionModel = model<SessionModel>({
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
});

// #endregion
