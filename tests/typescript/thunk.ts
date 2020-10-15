import { createStore, Thunk, thunk } from 'easy-peasy';

interface Injections {
  fetch: () => Promise<void>;
}

interface AuditModel {
  logs: string[];
  log: Thunk<AuditModel, string, Injections, StoreModel, Promise<number>>;
  empty: Thunk<AuditModel>;
  syncThunk: Thunk<AuditModel, undefined, undefined, StoreModel, string>;
  optionalPayloadThunk: Thunk<AuditModel, { foo: string } | void>;
  optionalPayloadThunkTwo: Thunk<AuditModel, { foo: string } | undefined>;
  optionalPayloadThunkThree: Thunk<AuditModel, { foo: string } | null>;
}

interface StoreModel {
  audit: AuditModel;
}

const model: StoreModel = {
  audit: {
    logs: [],
    log: thunk(
      async (
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
    syncThunk: thunk((actions, payload) => {
      return 'Woot!';
    }),
    empty: thunk(() => {}),
    optionalPayloadThunk: thunk((actions, payload) => {
      // typings:expect-error
      const foo = payload?.foo.substr(0, 3);
      if (payload == null) {
        return;
      }
      payload.foo.substr(0, 3);
    }),
    optionalPayloadThunkTwo: thunk((actions, payload) => {
      const foo = payload?.foo.substr(0, 3);
    }),
    optionalPayloadThunkThree: thunk((actions, payload) => {
      const foo = payload?.foo.substr(0, 3);
    }),
  },
};

const store = createStore(model);

store.getActions().audit.optionalPayloadThunk();
store.getActions().audit.optionalPayloadThunk({ foo: 'bar' });
store.getActions().audit.optionalPayloadThunkTwo();
store.getActions().audit.optionalPayloadThunkTwo({ foo: 'bar' });
// typings:expect-error
store.getActions().audit.optionalPayloadThunkThree();
store.getActions().audit.optionalPayloadThunkThree(null);
store.getActions().audit.optionalPayloadThunkThree({ foo: 'bar' });
// typings:expect-error
store.getActions().audit.optionalPayloadThunk(1);
store.getActions().audit.syncThunk().toUpperCase();
store
  .getActions()
  .audit.log('foo')
  .then((result) => result + 1);
// typings:expect-error
store.getActions().audit.log(1);
// typings:expect-error
store.getActions().audit.log();

store.getActions().audit.empty();
// typings:expect-error
store.getActions().audit.empty('foo');
