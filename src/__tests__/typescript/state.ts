import {
  State,
  Thunk,
  Action,
  Select,
  Effect,
  Listen,
  Listeners,
  Reducer,
} from 'easy-peasy'

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
  effectImp: Effect<Model, string | null>
  thunkImp: Thunk<Model, string>
  selectImp: Select<Model, number>
  selectUnion: Select<Model, string | void>
  listenImp: Listen<Model>
  listenersImp: Listeners<Model>
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

type ModelState = State<Model>

const assert = {} as ModelState

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
// typings:expect-error
assert.listenersImp

/**
 * Action Types
 */

// typings:expect-error
assert.actionImp(1)
// typings:expect-error
assert.effectImp('foo')
// typings:expect-error
assert.effectImp(null)
// typings:expect-error
assert.thunkImp('foo')
