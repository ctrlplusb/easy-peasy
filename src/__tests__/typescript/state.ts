import { State, Thunk, Action, Select, Listen, Reducer } from 'easy-peasy'

type Model = {
  stateArray: Array<string>
  stateBoolean: boolean
  stateDate: Date
  stateNull: null
  stateNumber: number
  stateRegExp: RegExp
  stateString: string
  stateUndefined: undefined
  stateUnion: string | null
  actionImp: Action<Model, number>
  thunkImp: Thunk<Model, string>
  selectImp: Select<Model, number>
  selectUnion: Select<Model, string | void>
  listenImp: Listen<Model>
  reducerImp: Reducer<number>
  nested: {
    stateArray: Array<string>
    stateBoolean: boolean
    stateDate: Date
    stateNull: null
    stateNumber: number
    stateRegExp: RegExp
    stateString: string
    stateUndefined: undefined
    stateUnion: string | null
    selectImp: Select<Model, number>
    reducerImp: Reducer<number>
  }
}

const assert: State<Model> = {
  stateArray: [],
  stateBoolean: true,
  stateDate: new Date(),
  stateNull: null,
  stateNumber: 1,
  stateRegExp: /abc/,
  stateString: 'foo',
  stateUndefined: undefined,
  stateUnion: 'bar',
  selectUnion: undefined,
  selectImp: 1,
  reducerImp: 1,
  nested: {
    stateArray: [],
    stateBoolean: true,
    stateDate: new Date(),
    stateNull: null,
    stateNumber: 1,
    stateRegExp: /abc/,
    stateString: 'foo',
    stateUndefined: undefined,
    stateUnion: 'bar',
    selectImp: 1,
    reducerImp: 1,
  },
}

/**
 * State Types
 */

assert.stateArray
assert.stateBoolean
assert.stateDate
assert.stateNull
assert.stateNumber
assert.stateRegExp
assert.stateString
assert.stateUndefined
assert.stateUnion
assert.selectUnion
assert.reducerImp + 10
assert.selectImp + 10

/**
 * Nested State Types
 */

assert.nested.stateArray
assert.nested.stateBoolean
assert.nested.stateDate
assert.nested.stateNull
assert.nested.stateNumber
assert.nested.stateRegExp
assert.nested.stateString
assert.nested.stateUndefined
assert.nested.stateUnion
assert.nested.reducerImp + 10
assert.nested.selectImp + 10

/**
 * Listener Types
 */

// typings:expect-error
assert.listenImp

/**
 * Action Types
 */

// typings:expect-error
assert.actionImp(1)
// typings:expect-error
assert.thunkImp('foo')
