import {
  createStore,
  Listeners,
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
  thunkImp: Thunk<Model, string | undefined | null>;
  reducerImp: Reducer<number>;
  computedImp: Computed<Model, number>;
  onAction: ActionOn<Model>;
  onThunk: ThunkOn<Model>;
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
    onAction: ActionOn<Model>;
    onThunk: ThunkOn<Model>;
  };
};

const model = ({} as unknown) as Model;

const store = createStore<Model>(model);

store.getListeners().onAction({
  type: 'foo',
  payload: undefined,
  resolvedTargets: [],
});

type ModelListeners = Listeners<Model>;
const assert = {} as ModelListeners;

// @ts-expect-error
assert.stateArray;
// @ts-expect-error
assert.stateBoolean;
// @ts-expect-error
assert.stateDate;
// @ts-expect-error
assert.stateNull;
// @ts-expect-error
assert.stateNumber;
// @ts-expect-error
assert.stateRegExp;
// @ts-expect-error
assert.stateString;
// @ts-expect-error
assert.stateUndefined;
// @ts-expect-error
assert.stateUnion;
// @ts-expect-error
assert.reducerImp;
// @ts-expect-error
assert.reducerImp;
// @ts-expect-error
assert.computedImp;
// @ts-expect-error
assert.actionImp(1);
// @ts-expect-error
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

// @ts-expect-error
assert.nested.stateArray;
// @ts-expect-error
assert.nested.stateBoolean;
// @ts-expect-error
assert.nested.stateDate;
// @ts-expect-error
assert.nested.stateNull;
// @ts-expect-error
assert.nested.stateNumber;
// @ts-expect-error
assert.nested.stateRegExp;
// @ts-expect-error
assert.nested.stateString;
// @ts-expect-error
assert.nested.stateUndefined;
// @ts-expect-error
assert.nested.stateUnion;
// @ts-expect-error
assert.nested.reducerImp;
// @ts-expect-error
assert.nested.reducerImp;
// @ts-expect-error
assert.nested.computedImp;
// @ts-expect-error
assert.nested.actionImp(1);
// @ts-expect-error
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
