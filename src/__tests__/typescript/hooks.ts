/* eslint-disable */

import {
  Actions,
  Thunk,
  Action,
  Reducer,
  State,
  useStoreActions,
  useStoreDispatch,
  useStoreState,
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
  thunkImp: Thunk<Model, string>;
  reducerImp: Reducer<number>;
  nested: {
    actionImp: Action<Model, number>;
    thunkImp: Thunk<Model, string>;
  };
}

const dispatch = useStoreDispatch();
dispatch({ type: 'FOO' });

let useStoreResult = useStoreState((state: State<Model>) => state.stateNumber);
useStoreResult + 1;
let useActionResult = useStoreActions(
  (actions: Actions<Model>) => actions.actionImp,
);
useActionResult(1);
