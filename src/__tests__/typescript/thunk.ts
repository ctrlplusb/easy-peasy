import { createStore, Thunk, thunk } from 'easy-peasy';

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
        { injections, getState, getStoreState, dispatch, meta },
      ) => {
        actions.log(payload);
        getState().logs.length;
        getStoreState().audit.logs.length;
        injections.fetch().then(() => 'done');
        dispatch.audit.log('foo');
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
