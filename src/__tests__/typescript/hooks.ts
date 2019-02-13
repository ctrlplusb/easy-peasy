import {
  Actions,
  Thunk,
  Action,
  Select,
  Listen,
  Reducer,
  State,
  createTypedHooks,
  useActions,
  useStore,
} from 'easy-peasy'

interface Model {
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
  listenImp: Listen<Model>
  reducerImp: Reducer<number>
  nested: {
    actionImp: Action<Model, number>
    thunkImp: Thunk<Model, string>
  }
}

let useStoreResult = useStore((state: State<Model>) => state.stateNumber)
useStoreResult + 1
let useActionResult = useActions((actions: Actions<Model>) => actions.actionImp)
useActionResult(1)

const typedHooks = createTypedHooks<Model>()

useStoreResult = typedHooks.useStore(state => state.stateNumber)
useStoreResult + 1
useActionResult = typedHooks.useActions(actions => actions.actionImp)
useActionResult(1)
