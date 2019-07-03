/* eslint-disable */

import { State, Computed, Thunk, Action, Reducer } from 'easy-peasy';
import { O } from 'ts-toolbelt';

type Model = {
  stateMap: { [key: string]: Array<string> };
  numberStateMap: { [key: number]: boolean };
  optionalStateMap?: { [key: string]: Array<string> };
  optionValueFieldsMap: { [key: string]: { name: string; age?: number } };
  optionalVal?: string;
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
    stateMap: { [key: string]: Array<string> };
    numberStateMap: { [key: number]: boolean };
    optionalStateMap?: { [key: string]: Array<string> };
    optionValueFieldsMap: { [key: string]: { name: string; age?: number } };
    optionalVal?: string;
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

const assert: State<Model> = {
  stateMap: {
    foo: ['bar'],
  },
  numberStateMap: {
    1: true,
  },
  optionalStateMap: {
    foo: ['bar'],
  },
  optionValueFieldsMap: {
    foo: {
      name: 'bob',
    },
  },
  stateArray: [],
  stateBoolean: true,
  stateDate: new Date(),
  stateNull: null,
  stateNumber: 1,
  stateRegExp: /abc/,
  stateString: 'foo',
  stateUndefined: undefined,
  stateUnion: 'bar',
  reducerImp: 1,
  computedImp: 1,
  nested: {
    stateMap: {
      foo: ['bar'],
    },
    numberStateMap: {
      1: true,
    },
    optionalStateMap: {
      foo: ['bar'],
    },
    optionValueFieldsMap: {
      foo: {
        name: 'bob',
      },
    },
    stateArray: [],
    stateBoolean: true,
    stateDate: new Date(),
    stateNull: null,
    stateNumber: 1,
    stateRegExp: /abc/,
    stateString: 'foo',
    stateUndefined: undefined,
    stateUnion: 'bar',
    reducerImp: 1,
    computedImp: 1,
  },
};

/**
 * State Types
 */

assert.stateArray;
assert.numberStateMap;
assert.stateBoolean;
assert.stateDate;
assert.stateNull;
assert.stateNumber;
assert.stateRegExp;
assert.stateString;
assert.stateUndefined;
assert.stateUnion;
assert.reducerImp + 10;

/**
 * Nested State Types
 */

assert.nested.stateArray;
assert.nested.stateBoolean;
assert.nested.stateDate;
assert.nested.stateNull;
assert.nested.stateNumber;
assert.nested.stateRegExp;
assert.nested.stateString;
assert.nested.stateUndefined;
assert.nested.stateUnion;
assert.nested.reducerImp + 10;

/**
 * Action Types
 */

// typings:expect-error
assert.actionImp(1);
// typings:expect-error
assert.thunkImp('foo');
