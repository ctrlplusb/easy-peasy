/* eslint-disable */

import { createStore, Thunk, thunk, Action } from 'easy-peasy';

interface Injections {
  fetch: () => Promise<void>;
}

interface AuditModel {
  logs: string[];
  log: Thunk<AuditModel, string, Injections, StoreModel, number>;
  empty: Thunk<AuditModel>;
}

interface StoreModel {
  audit: AuditModel;
}

const model: StoreModel = {
  audit: {
    logs: [],
    log: thunk(
      (
        actions,
        payload,
        {
          injections,
          getState,
          getStoreActions,
          getStoreState,
          dispatch,
          meta,
        },
      ) => {
        actions.log(payload);
        getState().logs.length;
        getStoreState().audit.logs.length;
        injections.fetch().then(() => 'done');
        dispatch({ type: 'FOO' });
        getStoreActions().audit.log('foo');
        meta.parent.concat(['foo']);
        meta.path.concat(['foo']);
        return 1;
      },
    ),
    empty: thunk(() => {}),
  },
};

const store = createStore(model);

store
  .getActions()
  .audit.log('foo')
  .then(result => result + 1);
// typings:expect-error
store.getActions().audit.log(1);
// typings:expect-error
store.getActions().audit.log();

store.getActions().audit.empty();
// typings:expect-error
store.getActions().audit.empty('foo');

interface ListeningModel {
  log: Action<ListeningModel, string>;
  doAction: Action<ListeningModel, string>;
  doThunk: Thunk<ListeningModel, string>;
  doActionInvalid: Action<ListeningModel, number>;
  doThunkInvalid: Thunk<ListeningModel, number>;
}

interface OtherModel {
  otherAction: Action<OtherModel, string>;
  otherThunk: Thunk<OtherModel, string>;
}

interface StoreListenerModel {
  listening: ListeningModel;
  other: OtherModel;
}

const listenAction: Thunk<ListeningModel, string> = thunk(
  (actions, payload) => {
    actions.log(payload);
  },
  {
    listenTo: actions => actions.doAction,
  },
);

const listenActionInvalidThunk: Thunk<ListeningModel, string> = thunk(
  (actions, payload) => {
    actions.log(payload);
  },
  // typings:expect-error
  {
    listenTo: actions => actions.doActionInvalid,
  },
);

const listenThunk: Thunk<ListeningModel, string> = thunk(
  (actions, payload) => {
    actions.log(payload);
  },
  {
    listenTo: actions => actions.doThunk,
  },
);

const listenThunkInvalidPaylod: Thunk<ListeningModel, string> = thunk(
  (actions, payload) => {
    actions.log(payload);
  },
  // typings:expect-error
  {
    listenTo: actions => actions.doThunkInvalid,
  },
);

const listenString: Thunk<ListeningModel, string> = thunk(
  (actions, payload) => {
    actions.log(payload);
  },
  {
    listenTo: () => 'ADD_TODO',
  },
);

const listenInvalid: Thunk<ListeningModel, string> = thunk(
  (actions, payload) => {
    actions.log(payload);
  },
  // typings:expect-error
  {
    listenTo: () => 1,
  },
);

const listenInvalidFunc: Thunk<AuditModel, string> = thunk(
  (actions, payload) => {
    actions.log(payload);
  },
  // typings:expect-error
  {
    listenTo: () => undefined,
  },
);

const multiListenAction: Thunk<ListeningModel, string> = thunk(
  (actions, payload) => {
    actions.log(payload);
  },
  {
    listenTo: actions => [actions.doAction, actions.doThunk],
  },
);

const multiListenActionInvalidThunk: Thunk<ListeningModel, string> = thunk(
  (actions, payload) => {
    actions.log(payload);
  },
  // typings:expect-error
  {
    listenTo: actions => [actions.doAction, actions.doThunkInvalid],
  },
);

const multiListeningActionString: Thunk<ListeningModel, string> = thunk(
  (actions, payload) => {
    actions.log(payload);
  },
  {
    listenTo: () => ['foo', 'bar'],
  },
);

const listeningActionString: Thunk<ListeningModel, string> = thunk(
  (actions, payload) => {
    actions.log(payload);
  },
  {
    listenTo: () => 'foo',
  },
);
