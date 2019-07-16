This section provides you with an overview of the type

Action<Model extends object = {}, Payload = void>

ActionOn<
  Model extends object = {},
  StoreModel extends object = {}
>

Actions<Model extends Object>

createTypedHooks<StoreModel extends Object = {}>

ResolvedState1<Arg1>
ResolvedState2<Arg1, Arg2>
ResolvedState3<Arg1, Arg2, Arg3>
ResolvedState4<Arg1, Arg2, Arg3, Arg4>
ResolvedState5<Arg1, Arg2, Arg3, Arg4, Arg5>
Computed<
  Model extends object = {},
  Result = any,
  ResolvedState extends ResolvedStates | void = void,
  StoreModel extends object = {}
>

Reducer<State = any, Action extends ReduxAction = AnyAction>

State<Model extends object>

Thunk<
  Model extends object = {},
  Payload = void,
  Injections = any,
  StoreModel extends object = {},
  Result = any
>

ThunkOn<
  Model extends object = {},
  Injections = any,
  StoreModel extends object = {},
  Result = any
>