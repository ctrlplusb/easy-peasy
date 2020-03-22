/* eslint-disable */

import {
  State,
  Computed,
  Thunk,
  Action,
  Reducer,
  ActionOn,
  ThunkOn,
} from 'easy-peasy';

class Person {
  private name: string;
  private surname: string;
  constructor(name: string, surname: string) {
    this.name = name;
    this.surname = surname;
  }
  fullName = () => `${this.name} ${this.surname}`;
}

type Model = {
  statePerson: Person;
  stateMap: { [key: string]: Array<string> };
  stateAny: any;
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
  onAction: ActionOn<Model>;
  onThunk: ThunkOn<Model>;
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
  statePerson: new Person('bob', 'boberson'),
  stateAny: 'what',
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

assert.statePerson;
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
