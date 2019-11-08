/* eslint-disable */

import {
  createStore,
  Actions,
  Thunk,
  Action,
  Reducer,
  Computed,
  ActionOn,
  ThunkOn,
} from 'easy-peasy';

type Model = {
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
  thunkImp: Thunk<Model, string | undefined | null>;
  reducerImp: Reducer<number>;
  computedImp: Computed<Model, number>;
  onAction: ActionOn<Model>;
  onThunk: ThunkOn<Model>;
  // push: Action<Model>;
  // pop: Action<Model>;
  nested: {
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
    computedImp: Computed<Model, number>;
  };
};

type ModelActions = Actions<Model>;

// @ts-ignore
const store = createStore<Model>({});

store.getActions().push();
store.getActions().pop();
store.getActions().actionImp(1);
store.getActions().thunkImp(null);

const assert = {} as ModelActions;

// typings:expect-error
assert.stateArray;
// typings:expect-error
assert.stateBoolean;
// typings:expect-error
assert.stateDate;
// typings:expect-error
assert.stateNull;
// typings:expect-error
assert.stateNumber;
// typings:expect-error
assert.stateRegExp;
// typings:expect-error
assert.stateString;
// typings:expect-error
assert.stateUndefined;
// typings:expect-error
assert.stateUnion;
// typings:expect-error
assert.reducerImp;
// typings:expect-error
assert.reducerImp;
// typings:expect-error
assert.computedImp;
assert.actionImp(1);
assert.actionNoPayload();
assert.thunkImp('foo').then(() => 'zing');
// typings:expect-error
assert.onAction({
  payload: 'foo',
  type: 'foo',
  resolvedTargets: ['foo'],
});
// typings:expect-error
assert.onThunk({
  payload: 'foo',
  type: 'foo',
  resolvedTargets: ['foo'],
});

// typings:expect-error
assert.nested.stateArray;
// typings:expect-error
assert.nested.stateBoolean;
// typings:expect-error
assert.nested.stateDate;
// typings:expect-error
assert.nested.stateNull;
// typings:expect-error
assert.nested.stateNumber;
// typings:expect-error
assert.nested.stateRegExp;
// typings:expect-error
assert.nested.stateString;
// typings:expect-error
assert.nested.stateUndefined;
// typings:expect-error
assert.nested.stateUnion;
// typings:expect-error
assert.nested.reducerImp;
// typings:expect-error
assert.nested.reducerImp;
// typings:expect-error
assert.nested.computedImp;
assert.nested.actionImp(1);
assert.nested.actionNoPayload();
assert.nested.thunkImp('foo').then(() => 'zing');
