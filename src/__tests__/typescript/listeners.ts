/* eslint-disable */

import {
  createStore,
  Listeners,
  Thunk,
  Action,
  Reducer,
  Computed,
  ActionOn,
  ThunkOn,
  Model,
  model,
} from 'easy-peasy';

type NestedModel = Model<{
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
  thunkImp: Thunk<StoreModel, string>;
  reducerImp: Reducer<number>;
  computedImp: Computed<StoreModel, number>;
  onAction: ActionOn<StoreModel>;
  onThunk: ThunkOn<StoreModel>;
}>;

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
  thunkImp: Thunk<StoreModel, string | undefined | null>;
  reducerImp: Reducer<number>;
  computedImp: Computed<StoreModel, number>;
  onAction: ActionOn<StoreModel>;
  onThunk: ThunkOn<StoreModel>;
  nested: NestedModel;
}>;

const storeModel = model<StoreModel>(({} as unknown) as StoreModel);

const store = createStore(storeModel);

store.getListeners().onAction({
  type: 'foo',
  payload: undefined,
  resolvedTargets: [],
});

type ModelListeners = Listeners<StoreModel>;
const assert = {} as ModelListeners;

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
// typings:expect-error
assert.actionImp(1);
// typings:expect-error
assert.thunkImp('foo').then(() => 'zing');
assert.onAction({
  payload: 'foo',
  type: 'foo',
  resolvedTargets: ['foo'],
});
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
// typings:expect-error
assert.nested.actionImp(1);
// typings:expect-error
assert.nested.thunkImp('foo').then(() => 'zing');
assert.nested.onAction({
  payload: 'foo',
  type: 'foo',
  resolvedTargets: ['foo'],
});
assert.nested.onThunk({
  payload: 'foo',
  type: 'foo',
  resolvedTargets: ['foo'],
});
