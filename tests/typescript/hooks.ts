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
} from 'easy-peasy';

interface Model {
  stateArray: Array<string>;
  stateBoolean: boolean;
  stateDate: Date;
  stateNull: null;
  stateNumber: number;
  stateRegExp: RegExp;
  stateString: string;
  stateUndefined: undefined;
  stateUnion: string | null;
  actionImp: Action<Model, number>;
  actionNoPayload: Action<Model>;
  thunkImp: Thunk<Model, string>;
  reducerImp: Reducer<number>;
  nested: {
    actionImp: Action<Model, number>;
    thunkImp: Thunk<Model, string>;
  };
}

let dispatch = useStoreDispatch();
dispatch({ type: 'FOO' });

let useStoreResult = useStoreState((state: State<Model>) => state.stateNumber);
useStoreResult + 1;
let useActionResult = useStoreActions(
  (actions: Actions<Model>) => actions.actionImp,
);
useActionResult(1);

let store = useStore<Model>();
`${store.getState().stateString  }world`;

const typedHooks = createTypedHooks<Model>();

useStoreResult = typedHooks.useStoreState(state => state.stateNumber);
useStoreResult + 1;
useActionResult = typedHooks.useStoreActions(actions => actions.actionImp);
useActionResult(1);
dispatch = typedHooks.useStoreDispatch();
dispatch({
  type: 'FOO',
});
store = typedHooks.useStore();
`${store.getState().stateString  }world`;

const actionNoPayload = typedHooks.useStoreActions(
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
