/* eslint-disable */

import { Actions, Thunk, Action, Reducer, Computed } from 'easy-peasy';

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
  thunkImp: Thunk<Model, string>;
  reducerImp: Reducer<number>;
  computedImp: Computed<Model, number>;
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
    thunkImp: Thunk<Model, string>;
    reducerImp: Reducer<number>;
    computedImp: Computed<Model, number>;
  };
};

type ModelActions = Actions<Model>;

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
assert.thunkImp('foo').then(() => 'zing');

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
assert.nested.thunkImp('foo').then(() => 'zing');
