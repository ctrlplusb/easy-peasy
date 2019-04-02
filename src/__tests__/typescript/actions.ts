/* eslint-disable */

import { Actions, Thunk, Action, Select, Listen, Reducer } from 'easy-peasy';

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
  selectImp: Select<Model, number>;
  listenImp: Listen<Model>;
  reducerImp: Reducer<number>;
  nested: {
    actionImp: Action<Model, number>;
    thunkImp: Thunk<Model, string>;
  };
};

type ModelActions = Actions<Model>;

const assert = {} as ModelActions;

/**
 * State Types
 */

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
assert.selectImp;

/**
 * Listener Types
 */

// typings:expect-error
assert.listenImp;
// typings:expect-error
assert.reducerImp;

/**
 * Action Types
 */

assert.actionImp(1);
assert.thunkImp('foo');

/**
 * Nested Action Types
 */

assert.nested.actionImp(1);
assert.nested.thunkImp('foo');
