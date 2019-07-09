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
  actions => actions.doAction,
  (state, target) => {
    const [foo] = target.resolvedTargets;
    foo + 'bar';
    target.type + 'foo';
    if (target.error != null) {
      target.error.stack;
    }
    state.logs.push(target.payload);
  },
);

const listeningActionInvalidPayload: ActionOn<
  ListeningModel,
  string
> = actionOn(
  // typings:expect-error
  actions => actions.doActionInvalid,
  (state, target) => {
    state.logs.push(target.payload);
  },
);

const listeningThunk: ActionOn<ListeningModel, string> = actionOn(
  actions => actions.doThunk,
  (state, target) => {
    state.logs.push(target.payload);
  },
);

const listeningThunkInvalidPayload: ActionOn<ListeningModel, string> = actionOn(
  // typings:expect-error
  actions => actions.doThunkInvalid,
  (state, target) => {
    state.logs.push(target.payload);
  },
);

const listeningString: ActionOn<ListeningModel, string> = actionOn(
  () => 'ADD_TODO',
  (state, target) => {
    state.logs.push(target.payload);
  },
);

const listeningInvalid: ActionOn<ListeningModel, string> = actionOn(
  // typings:expect-error
  () => 1,
  // typings:expect-error
  (state, target) => {
    state.logs.push(target.payload);
  },
);

const listeningInvalidFunc: ActionOn<ListeningModel, string> = actionOn(
  // typings:expect-error
  () => undefined,
  // typings:expect-error
  (state, target) => {
    state.logs.push(target.payload);
  },
);

const multiListeningAction: ActionOn<ListeningModel, string> = actionOn(
  actions => [actions.doAction, actions.doThunk],
  (state, target) => {
    state.logs.push(target.payload);
  },
);

const multiListeningActionInvalid: ActionOn<ListeningModel, string> = actionOn(
  // typings:expect-error
  actions => [actions.doAction, actions.doThunkInvalid],
  (state, target) => {
    state.logs.push(target.payload);
  },
);

const multiListeningActionString: ActionOn<ListeningModel, string> = actionOn(
  () => ['foo', 'bar'],
  (state, target) => {
    state.logs.push(target.payload);
  },
);

const listeningActionString: ActionOn<ListeningModel, string> = actionOn(
  () => 'foo',
  (state, target) => {
    state.logs.push(target.payload);
  },
);
