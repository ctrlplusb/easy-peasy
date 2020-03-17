import {
  createStore,
  Actions,
  Thunk,
  Action,
  Reducer,
  Computed,
  ActionOn,
  ThunkOn,
  model,
  Model,
} from 'easy-peasy';

class Person {
  constructor(public name: string, public age: number) {}
}

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
  stateClass: Person;
  stateOptional?: number;
  actionImp: Action<NestedModel, number>;
  actionNoPayload: Action<NestedModel>;
  thunkImp: Thunk<NestedModel, string, any, StoreModel, Promise<string>>;
  reducerImp: Reducer<number>;
  computedImp: Computed<NestedModel, number>;
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
  stateClass: Person;
  stateOptional?: number;
  actionImp: Action<StoreModel, number>;
  actionNoPayload: Action<StoreModel>;
  thunkImp: Thunk<
    StoreModel,
    string | undefined | null,
    any,
    StoreModel,
    Promise<string>
  >;
  reducerImp: Reducer<number>;
  computedImp: Computed<StoreModel, number>;
  onAction: ActionOn<StoreModel>;
  onThunk: ThunkOn<StoreModel>;
  push: Action<StoreModel>;
  pop: Action<StoreModel>;
  nested: NestedModel;
}>;

type ModelActions = Actions<StoreModel>;

const storeModel = model<StoreModel>(({} as unknown) as StoreModel);

const store = createStore(storeModel);

// typings:expect-error
store.getActions().actionImp('invalid payload');

store.getActions().push();

store.getActions().pop();

store.getActions().actionImp(1);

// typings:expect-error
store.getActions().actionImp('foo');

store.getActions().thunkImp(null);

store.getActions().thunkImp(undefined);

store
  .getActions()
  .thunkImp('foo')
  .then(bar => {
    bar + 'baz';
  });

// typings:expect-error
store.getActions().thunkImp(true);

const assert = ({} as unknown) as ModelActions;

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
assert.stateOptional;

// typings:expect-error
assert.stateClass;

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

assert.nested.thunkImp('foo').then(bar => bar + 'zing');
