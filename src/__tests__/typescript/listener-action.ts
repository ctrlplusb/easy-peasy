import { actionOn, ActionOn, Action, Thunk } from 'easy-peasy';

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

const listeningAction: ActionOn<ListeningModel, string, StoreModel> = actionOn(
  (state, target, { targets }) => {
    const [foo] = targets;
    foo + 'bar';
    target.type + 'foo';
    target.name + 'foo';
    if (target.error != null) {
      target.error.stack;
    }
    state.logs.push(target.payload);
  },
  actions => actions.doAction,
);

const listeningActionInvalidPayload: ActionOn<
  ListeningModel,
  string
> = actionOn(
  (state, target) => {
    state.logs.push(target.payload);
  },
  // typings:expect-error
  actions => actions.doActionInvalid,
);

const listeningThunk: ActionOn<ListeningModel, string> = actionOn(
  (state, target) => {
    state.logs.push(target.payload);
  },
  actions => actions.doThunk,
);

const listeningThunkInvalidPayload: ActionOn<ListeningModel, string> = actionOn(
  (state, target) => {
    state.logs.push(target.payload);
  },
  // typings:expect-error
  actions => actions.doThunkInvalid,
);

const listeningString: ActionOn<ListeningModel, string> = actionOn(
  (state, target) => {
    state.logs.push(target.payload);
  },
  () => 'ADD_TODO',
);

const listeningInvalid: ActionOn<ListeningModel, string> = actionOn(
  (state, target) => {
    state.logs.push(target.payload);
  },
  // typings:expect-error
  () => 1,
);

const listeningInvalidFunc: ActionOn<ListeningModel, string> = actionOn(
  (state, target) => {
    state.logs.push(target.payload);
  },
  // typings:expect-error
  () => undefined,
);

const multiListeningAction: ActionOn<ListeningModel, string> = actionOn(
  (state, target) => {
    state.logs.push(target.payload);
  },
  actions => [actions.doAction, actions.doThunk],
);

const multiListeningActionInvalid: ActionOn<ListeningModel, string> = actionOn(
  (state, target) => {
    state.logs.push(target.payload);
  },
  // typings:expect-error
  actions => [actions.doAction, actions.doThunkInvalid],
);

const multiListeningActionString: ActionOn<ListeningModel, string> = actionOn(
  (state, target) => {
    state.logs.push(target.payload);
  },
  () => ['foo', 'bar'],
);

const listeningActionString: ActionOn<ListeningModel, string> = actionOn(
  (state, target) => {
    state.logs.push(target.payload);
  },
  () => 'foo',
);
