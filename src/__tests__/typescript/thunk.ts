import { Thunk, thunk } from 'easy-peasy';

interface Injections {
  fetch: () => Promise<void>;
}

interface AuditModel {
  logs: string[];
  log: Thunk<AuditModel, string, Injections, StoreModel>;
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
      },
    ),
  },
};
