/* eslint-disable */

import {
  Actions,
  Thunk,
  Action,
  Reducer,
  State,
  createTypedHooks,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
  useStore,
  Model,
} from 'easy-peasy';

type StoreModel = Model<{
  stateArray: Array<string>;
  stateBoolean: boolean;
  stateDate: Date;
  stateNull: null;
  stateNumber: number;
  stateRegExp: RegExp;
  stateString: string;
  stateUndefined: undefined;
  stateUnion: string | null;
  actionImp: Action<StoreModel, number>;
  actionNoPayload: Action<StoreModel>;
  thunkImp: Thunk<StoreModel, string>;
  reducerImp: Reducer<number>;
  nested: {
    actionImp: Action<StoreModel, number>;
    thunkImp: Thunk<StoreModel, string>;
  };
}>;

let dispatch = useStoreDispatch();
dispatch({ type: 'FOO' });

let useStoreResult = useStoreState(
  (state: State<StoreModel>) => state.stateNumber,
);
useStoreResult + 1;
let useActionResult = useStoreActions(
  (actions: Actions<StoreModel>) => actions.actionImp,
);
useActionResult(1);

let store = useStore<StoreModel>();
store.getState().stateString + 'world';

const typedHooks = createTypedHooks<StoreModel>();

useStoreResult = typedHooks.useStoreState(state => state.stateNumber);
useStoreResult + 1;
useActionResult = typedHooks.useStoreActions(actions => actions.actionImp);
useActionResult(1);
dispatch = typedHooks.useStoreDispatch();
dispatch({
  type: 'FOO',
});
store = typedHooks.useStore();
store.getState().stateString + 'world';

let actionNoPayload = typedHooks.useStoreActions(
  actions => actions.actionNoPayload,
);
actionNoPayload();

typedHooks.useStoreState(
  state => ({ num: state.stateNumber, str: state.stateString }),
  (prev, next) => {
    prev.num += 1;
    // typings:expect-error
    prev.num += 'foo';
    return prev.num === next.num;
  },
);
