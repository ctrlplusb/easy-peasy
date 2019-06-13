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

store.dispatch.audit.log('foo').then(result => result + 1);
// typings:expect-error
store.dispatch.audit.log(1);
// typings:expect-error
store.dispatch.audit.log();

store.dispatch.audit.empty();
// typings:expect-error
store.dispatch.audit.empty('foo');

interface ListeningModel {
  log: Action<ListeningModel, string>;
}

interface TargetModel {
  doAction: Action<TargetModel, string>;
  doThunk: Thunk<TargetModel, string>;
  doActionInvalid: Action<TargetModel, number>;
  doThunkInvalid: Thunk<TargetModel, number>;
}

// @ts-ignore
const targetModel: TargetModel = {};

const listenAction: Thunk<ListeningModel, string> = thunk(
  (actions, payload) => {
    actions.log(payload);
  },
  {
    listenTo: targetModel.doAction,
  },
);

const listenActionInvalidThunk: Thunk<ListeningModel, string> = thunk(
  (actions, payload) => {
    actions.log(payload);
  },
  // typings:expect-error
  {
    listenTo: targetModel.doActionInvalid,
  },
);

const listenThunk: Thunk<ListeningModel, string> = thunk(
  (actions, payload) => {
    actions.log(payload);
  },
  {
    listenTo: targetModel.doThunk,
  },
);

const listenThunkInvalidPaylod: Thunk<ListeningModel, string> = thunk(
  (actions, payload) => {
    actions.log(payload);
  },
  // typings:expect-error
  {
    listenTo: targetModel.doThunkInvalid,
  },
);

const listenString: Thunk<ListeningModel, string> = thunk(
  (actions, payload) => {
    actions.log(payload);
  },
  {
    listenTo: 'ADD_TODO',
  },
);

const listenInvalid: Thunk<ListeningModel, string> = thunk(
  (actions, payload) => {
    actions.log(payload);
  },
  // typings:expect-error
  {
    listenTo: 1,
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
