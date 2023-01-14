import { actionOn, ActionOn, Action, Thunk } from 'easy-peasy';

interface ListeningModel {
  logs: string[];
  doActionString: Action<ListeningModel, string>;
  doThunkString: Thunk<ListeningModel, string>;
  doActionNumber: Action<ListeningModel, number>;
  doThunkNumber: Thunk<ListeningModel, number>;
}

interface OtherModel {
  otherAction: Action<OtherModel, string>;
  otherThunk: Thunk<OtherModel, string>;
}

interface StoreModel {
  listening: ListeningModel;
  other: OtherModel;
}

const valid1: ActionOn<ListeningModel, StoreModel> = actionOn(
  (actions) => actions.doActionString,
  (state, target) => {
    const [foo] = target.resolvedTargets;
    `${foo}bar`;
    `${target.type}foo`;
    if (target.error != null) {
      target.error.stack;
    }
    state.logs.push(target.payload);
  },
);

const invalid1: ActionOn<ListeningModel> = actionOn(
  (actions) => actions.doActionNumber,
  (state, target) => {
    // typings:expect-error
    state.logs.push(target.payload);
  },
);

const valid2: ActionOn<ListeningModel> = actionOn(
  (actions) => actions.doThunkString,
  (state, target) => {
    state.logs.push(target.payload);
  },
);

const invalid2: ActionOn<ListeningModel> = actionOn(
  (actions) => actions.doThunkNumber,
  (state, target) => {
    // typings:expect-error
    state.logs.push(target.payload);
  },
);

const valid3: ActionOn<ListeningModel> = actionOn(
  () => 'ADD_TODO',
  (state, target) => {
    state.logs.push(target.payload);
  },
);

const invalid3: ActionOn<ListeningModel> = actionOn(
  // typings:expect-error
  () => 1,
  (state, target) => {
    state.logs.push(target.payload);
  },
);

const invalid4: ActionOn<ListeningModel> = actionOn(
  // typings:expect-error
  () => undefined,
  (state, target) => {
    state.logs.push(target.payload);
  },
);

const valid4: ActionOn<ListeningModel> = actionOn(
  (actions) => [actions.doActionString, actions.doThunkString],
  (state, target) => {
    state.logs.push(target.payload);
  },
);

const invalid5: ActionOn<ListeningModel> = actionOn(
  (actions) => [actions.doActionString, actions.doThunkNumber],
  (state, target) => {
    // typings:expect-error
    state.logs.push(target.payload);
  },
);

const valid5: ActionOn<ListeningModel> = actionOn(
  (actions) => [actions.doActionString, actions.doThunkNumber],
  (state, target) => {
    if (typeof target.payload === 'string') {
      state.logs.push(target.payload);
    } else {
      target.payload + 10;
    }
  },
);

const valid6: ActionOn<ListeningModel> = actionOn(
  () => ['foo', 'bar'],
  (state, target) => {
    state.logs.push(target.payload);
  },
);

const valid7: ActionOn<ListeningModel> = actionOn(
  () => 'foo',
  (state, target) => {
    state.logs.push(target.payload);
  },
);

const valid8: ActionOn<ListeningModel> = actionOn(
  (actions) => [actions.doActionString],
  (state, target) => ({
    ...state,
    logs: [...state.logs, target.payload]
  }),
  {
    immer: false
  }
);