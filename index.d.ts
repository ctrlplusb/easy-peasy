import { Component } from 'react'
import { KeysOfType, Omit, Overwrite } from 'typelevel-ts'
import { Param0, Param1 } from 'type-zoo'
import {
  compose,
  AnyAction,
  Action as ReduxAction,
  Dispatch as ReduxDispatch,
  Reducer as ReduxReducer,
  Store as ReduxStore,
  Middleware,
} from 'redux'

/**
 * The standard ReturnType helper of TypeScript doesn't handle generic type
 * aliases very well. This workaround type does.
 * https://github.com/Microsoft/TypeScript/issues/26856
 */
type UnsafeReturnType<T> = T extends (...args: any[]) => infer R ? R : any

/**
 * The types that represent "natural", single level state values in or store.
 * i.e. not actions or objects.
 */
type NaturalState =
  | Array<any>
  | boolean
  | Date
  | null
  | number
  | RegExp
  | string
  | undefined

type PickWithType<Base, Condition> = Pick<
  Base,
  {
    [Key in keyof Base]: Condition extends Extract<Base[Key], Condition>
      ? Key
      : never
  }[keyof Base]
>

type AsyncActionTypes =
  | Thunk<any, any, any, any, any>
  | Effect<any, any, any, any>

type ActionTypes = AsyncActionTypes | Action<any, any>

type UtilTypes =
  | Select<any, any>
  | Reducer<any>
  | Thunk<any, any, any, any, any>
  | Effect<any, any, any, any>
  | Action<any, any>
  | Function

type Meta = {
  path: string[]
  parent: string[]
}

/**
 * Filters a model into a type that represents the actions (and effects) only
 *
 * @example
 *
 * type OnlyActions = Actions<Model>;
 */
export type Actions<Model extends Object> = {
  [P in keyof (Pick<Model, KeysOfType<Model, PickWithType<Model, object>>>)]: Actions<Model[P]>
} &
  {
    [P in keyof Pick<Model, KeysOfType<Model, AsyncActionTypes>>]: Param1<
      Model[P]
    > extends void
      ? () => UnsafeReturnType<Model[P]> extends Promise<any>
          ? UnsafeReturnType<Model[P]>
          : Promise<UnsafeReturnType<Model[P]>>
      : (
          payload: Param1<Model[P]>,
        ) => UnsafeReturnType<Model[P]> extends Promise<any>
          ? UnsafeReturnType<Model[P]>
          : Promise<UnsafeReturnType<Model[P]>>
  } &
  {
    [P in keyof Pick<Model, KeysOfType<Model, Action<any, any>>>]: Param1<
      Model[P]
    > extends void
      ? () => void
      : (payload: Param1<Model[P]>) => void
  }

/**
 * Filters a model into a type that represents the state only (i.e. no actions)
 *
 * @example
 *
 * type StateOnly = State<Model>;
 */
export type State<Model extends Object> = {
  [P in keyof (Pick<Model, KeysOfType<Model, PickWithType<Model, object>>>)]: State<Model[P]>
} &
  { [P in keyof Pick<Model, KeysOfType<Model, NaturalState>>]: Model[P] } &
  {
    readonly [P in keyof Pick<
      Model,
      KeysOfType<Model, Select<any, any>>
    >]: UnsafeReturnType<Model[P]>
  } &
  {
    readonly [P in keyof Pick<
      Model,
      KeysOfType<Model, Reducer<any, any>>
    >]: UnsafeReturnType<Model[P]>
  }

/**
 * Configuration interface for the createStore
 */
export interface EasyPeasyConfig<
  InitialState extends Object = {},
  Injections = void
> {
  compose?: typeof compose
  devTools?: boolean
  initialState?: InitialState
  injections?: Injections
  middlewares?: Array<Middleware<any, any, any>>
  reducerEnhancer?: (reducer: Reducer<any, any>) => Reducer<any, any>
}

/**
 * Enhances the Redux Dispatch with actions
 *
 * @example
 *
 * type DispatchWithActions = Dispatch<StoreModel>;
 */
export type Dispatch<
  StoreModel,
  Action extends ReduxAction = ReduxAction<any>
> = Actions<StoreModel> & ReduxDispatch<Action>

/**
 * Represents a Redux store, enhanced by easy peasy.
 *
 * @example
 *
 * type EnhancedReduxStore = Store<StoreModel>;
 */
export type Store<StoreModel> = Overwrite<
  ReduxStore<State<StoreModel>>,
  {
    dispatch: Dispatch<StoreModel>
  }
>

/**
 * A thunk type.
 *
 * Useful when declaring your model.
 *
 * @example
 *
 * import { Thunk } from 'easy-peasy';
 *
 * interface TodosModel {
 *   todos: Array<string>;
 *   addTodo: Effect<TodosModel, string>;
 * }
 */
export type Thunk<
  Model extends Object = {},
  Payload = void,
  Injections = void,
  StoreModel extends Object = {},
  Result = void
> = (
  actions: Actions<Model>,
  payload: Payload,
  helpers: {
    dispatch: Dispatch<StoreModel>
    getState: () => State<StoreModel>
    injections: Injections
    meta: Meta
  },
) => Result

/**
 * Declares an thunk action type against your model.
 *
 * https://github.com/ctrlplusb/easy-peasy#thunkaction
 *
 * @example
 *
 * import { thunk } from 'easy-peasy';
 *
 * const store = createStore({
 *   login: thunk(async (actions, payload) => {
 *    const user = await loginService(payload);
 *    actions.loginSucceeded(user);
 *  })
 * });
 */
export function thunk<
  Model extends Object = {},
  Payload = void,
  Injections = void,
  StoreModel extends Object = {},
  Result = void
>(
  effect: Thunk<Model, Payload, Injections, StoreModel, Result>,
): Thunk<Model, Payload, Injections, StoreModel, Result>

/**
 * An effect type.
 *
 * Useful when declaring your model.
 *
 * @example
 *
 * import { Effect } from 'easy-peasy';
 *
 * interface Model {
 *   todos: Array<string>;
 *   addTodo: Effect<Model, string>;
 * }
 */
export type Effect<
  StoreModel extends Object = {},
  Payload = void,
  Injections = void,
  Result = void
> = (
  dispatch: Dispatch<StoreModel>,
  payload: Payload,
  getState: () => State<StoreModel>,
  injections: Injections,
  meta: Meta,
) => Result

/**
 * Declares an effect action type against your model.
 *
 * @example
 *
 * import { effect } from 'easy-peasy';
 *
 * const store = createStore({
 *   login: effect(async (dispatch, payload) => {
 *    const user = await loginService(payload);
 *    dispatch.loginSucceeded(user);
 *  })
 * });
 */
export function effect<
  StoreModel extends Object = {},
  Payload = any,
  Result = any,
  Injections = any
>(
  effect: Effect<StoreModel, Payload, Result, Injections>,
): Effect<StoreModel, Payload, Result, Injections>

/**
 * Action listeners type.
 *
 * Useful when declaring your model.
 *
 * @example
 *
 * import { Listeners } from 'easy-peasy';
 *
 * interface Model {
 *   userListeners: Listeners<Model>;
 * }
 *
 * listen(on => {
 *   on()
 * })
 */
export type Listen<
  Model extends Object = {},
  Injections = void,
  StoreModel extends Object = {}
> = (
  on: <ListenAction extends ActionTypes>(
    action: ListenAction,
    handler: Thunk<Model, Param1<ListenAction>, Injections, StoreModel>,
  ) => void,
) => void

/**
 * Declares action listeners against your model.
 *
 * https://github.com/ctrlplusb/easy-peasy#listenersattach
 *
 * @example
 *
 * import { listen } from 'easy-peasy';
 *
 * const store = createStore({
 *   users: userModel,
 *   audit: {
 *     logs: [],
 *     add: (state, payload) => {
 *       state.logs.push(payload)
 *     },
 *     userListeners: listen((on) => {
 *       on(userModel.login, (actions) => {
 *          actions.add('User logged in');
 *       });
 *     })
 *   }
 * });
 */
export function listen<Model extends Object = {}>(
  attach: Listen<Model>,
): Listen<Model>

/**
 * Action listeners type.
 *
 * Useful when declaring your model.
 *
 * @example
 *
 * import { Listeners } from 'easy-peasy';
 *
 * interface StoreModel {
 *   userListeners: Listeners<StoreModel>;
 * }
 */
export type Listeners<StoreModel extends Object = {}> = (
  actions: Actions<StoreModel>,
  attach: <ActionType>(
    action: ActionType,
    listener: (
      dispatch: Dispatch<StoreModel>,
      payload: Param0<ActionType>,
    ) => any,
  ) => void,
) => void

/**
 * Declares action listeners against your model.
 *
 * https://github.com/ctrlplusb/easy-peasy#listenersattach
 *
 * @example
 *
 * import { listeners } from 'easy-peasy';
 *
 * const store = createStore({
 *   userListeners: listeners((actions, on) => {
 *     on(actions.user.login, (dispatch) => {
 *        dispatch.audit.add('User logged in');
 *     });
 *   })
 * });
 */
export function listeners<StoreModel extends Object = {}>(
  mapListeners: Listeners<StoreModel>,
): Listeners<StoreModel>

/**
 * An action type.
 *
 * Useful when declaring your model.
 *
 * @example
 *
 * import { Action } from 'easy-peasy';
 *
 * interface Model {
 *   todos: Array<Todo>; ;
 *   addTodo: Action<Model, Todo>;
 * }
 */
export type Action<Model extends Object = {}, Payload = any> = (
  state: State<Model>,
  payload: Payload,
) => void | State<Model>

/**
 * A select type.
 *
 * Useful when declaring your model.
 *
 * @example
 *
 * import { Select } from 'easy-peasy';
 *
 * interface Model {
 *   products: Array<Product>;
 *   totalPrice: Select<Model, number>;
 * }
 */
export type Select<Model extends Object = {}, Result = any> = (
  state: State<Model>,
  dependencies?: Array<Select<any, any>>,
) => Result

/**
 * Allows you to declare derived state against your model.
 *
 * https://github.com/ctrlplusb/easy-peasy#selectselector
 *
 * @example
 *
 * import { select } from 'easy-peasy';
 *
 * const store = createStore({
 *   products: [],
 *   totalPrice: select(state =>
 *     state.products.reduce((acc, cur) => acc + cur.price, 0)
 *   )
 * });
 */
export function select<Model extends Object = {}, Result = any>(
  select: Select<Model, Result>,
  dependencies?: Array<Select<any, any>>,
): Select<Model, Result>

/**
 * A reducer type.
 *
 * Useful when declaring your model.
 *
 * @example
 *
 * import { Reducer } from 'easy-peasy';
 *
 * interface Model {
 *   router: Reducer<ReactRouterState>;
 * }
 */
export type Reducer<
  State = any,
  Action extends ReduxAction = AnyAction
> = ReduxReducer<State>

/**
 * Allows you to declare a custom reducer to manage a bit of your state.
 *
 * https://github.com/ctrlplusb/easy-peasy#reducerfn
 *
 * @example
 *
 * import { reducer } from 'easy-peasy';
 *
 * const store = createStore({
 *   counter: reducer((state = 1, action) => {
 *     switch (action.type) {
 *       case 'INCREMENT': return state + 1;
 *       default: return state;
 *     }
 *   })
 * });
 */
export function reducer<State extends Object = {}>(
  state: Reducer<State>,
): Reducer<State>

/**
 * Creates an easy-peasy powered Redux store.
 *
 * https://github.com/ctrlplusb/easy-peasy#createstoremodel-config
 *
 * @example
 *
 * import { createStore } from 'easy-peasy';
 *
 * interface StoreModel {
 *   todos: {
 *     items: Array<string>;
 *   }
 * }
 *
 * const store = createStore<StoreModel>({
 *   todos: {
 *     items: [],
 *   }
 * })
 */
export function createStore<StoreModel extends Object = {}>(
  model: StoreModel,
  config?: EasyPeasyConfig,
): Store<StoreModel>

/**
 * A React Hook allowing you to use state within your component.
 *
 * https://github.com/ctrlplusb/easy-peasy#usestoremapstate-externals
 *
 * @example
 *
 * import { useStore, State } from 'easy-peasy';
 *
 * function MyComponent() {
 *   const todos = useStore((state: State<StoreModel>) => state.todos.items);
 *   return todos.map(todo => <Todo todo={todo} />);
 * }
 */
export function useStore<StoreModel extends Object = {}, Result = any>(
  mapState: (state: State<StoreModel>) => Result,
  dependencies?: Array<any>,
): Result

/**
 * A React Hook allowing you to use actions within your component.
 *
 * https://github.com/ctrlplusb/easy-peasy#useactionmapaction
 *
 * @example
 *
 * import { useAction, Dispatch } from 'easy-peasy';
 *
 * function MyComponent() {
 *   const addTodo = useAction((dispatch: Dispatch<StoreModel>) => dispatch.todos.add);
 *   return <AddTodoForm save={addTodo} />;
 * }
 */
export function useAction<StoreModel extends Object = {}, Result = any>(
  mapAction: (actions: Dispatch<StoreModel>) => Result,
): Result

/**
 * A React Hook allowing you to use actions within your component.
 *
 * https://github.com/ctrlplusb/easy-peasy#useactionsmapactions
 *
 * @example
 *
 * import { useActions, Actions } from 'easy-peasy';
 *
 * function MyComponent() {
 *   const addTodo = useAction((actions: Actions<StoreModel>) => actions.todos.add);
 *   return <AddTodoForm save={addTodo} />;
 * }
 */
export function useActions<StoreModel extends Object = {}, Result = any>(
  mapActions: (actions: Actions<StoreModel>) => Result,
): Result

/**
 * A React Hook allowing you to use the store's dispatch within your component.
 *
 * https://github.com/ctrlplusb/easy-peasy#usedispatch
 *
 * @example
 *
 * import { useDispatch } from 'easy-peasy';
 *
 * function MyComponent() {
 *   const dispatch = useDispatch();
 *   return <AddTodoForm save={(todo) => dispatch({ type: 'ADD_TODO', payload: todo })} />;
 * }
 */
export function useDispatch<StoreModel extends Object = {}>(): Dispatch<
  StoreModel
>

/**
 * A utility function used to create pre-typed hooks.
 *
 * @example
 * const { useActions, useStore, useDispatch } = createTypedHooks<StoreModel>();
 *
 * useActions(actions => actions.todo.add); // fully typed
 */
export function createTypedHooks<StoreModel extends Object = {}>(): {
  useActions: <Result = any>(
    mapActions: (actions: Actions<StoreModel>) => Result,
  ) => Result
  useAction: <Result = any>(
    mapAction: (actions: Dispatch<StoreModel>) => Result,
  ) => Result
  useDispatch: () => Dispatch<StoreModel>
  useStore: <Result = any>(
    mapState: (state: State<StoreModel>) => Result,
    dependencies?: Array<any>,
  ) => Result
}

/**
 * Exposes the store to your app (and hooks).
 *
 * https://github.com/ctrlplusb/easy-peasy#storeprovider
 *
 * @example
 *
 * import { StoreProvider } from 'easy-peasy';
 *
 * ReactDOM.render(
 *   <StoreProvider store={store}>
 *     <App />
 *   </StoreProvider>
 * );
 */
export class StoreProvider<StoreModel = any> extends Component<{
  store: Store<StoreModel>
}> {}
