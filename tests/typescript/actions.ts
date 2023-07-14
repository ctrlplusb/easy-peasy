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
  stateObject: object;
  stateMap: Map<string, string>;
  actionImp: Action<Model, number>;
  actionNoPayload: Action<Model>;
  thunkImp: Thunk<Model, string | undefined | null>;
  reducerImp: Reducer<number>;
  computedImp: Computed<Model, number>;
  onAction: ActionOn<Model>;
  onThunk: ThunkOn<Model>;
  push: Action<Model>;
  pop: Action<Model>;
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
  nestedNoActions: {
    stateObject: object;
    stateString: string;
  };
};

type ModelActions = Actions<Model>;

const store = createStore<Model>({} as any);

store.getActions().push();
store.getActions().pop();
store.getActions().actionImp(1);
store.getActions().thunkImp(null);

const assert = {} as ModelActions;

// @ts-expect-error
assert.stateObject;
// @ts-expect-error
assert.stateMap;
// @ts-expect-error
assert.nestedNoActions;
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
assert.actionImp(1);
assert.actionNoPayload();
assert.thunkImp('foo').then(() => 'zing');
// @ts-expect-error
assert.onAction({
  payload: 'foo',
  type: 'foo',
  resolvedTargets: ['foo'],
});
// @ts-expect-error
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
assert.nested.actionImp(1);
assert.nested.actionNoPayload();
assert.nested.thunkImp('foo').then(() => 'zing');
