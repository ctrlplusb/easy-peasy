import { Component } from 'react'
import { KeysOfType, Omit, Overwrite } from 'typelevel-ts'
import { Param1 } from 'type-zoo'
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

type ActionTypes = Action<any, any> | Effect<any, any, any, any>

type UtilTypes =
  | Select<any, any>
  | Reducer<any>
  | Action<any, any>
  | Effect<any, any, any, any>
  | Function

interface ActionCreator<TPayload = any, TResult = any> {
  (payload: TPayload): TResult
}

/**
 * This type recursively filters a model down to the properties which
 * represent actions
 */
type Actions<U extends Object> = {
  [P in keyof (Omit<
    U,
    KeysOfType<Pick<U, KeysOfType<U, Object>>, NaturalState | UtilTypes>
  >)]: Actions<U[P]>
} &
  {
    [P in keyof Pick<U, KeysOfType<U, ActionTypes>>]: ActionCreator<
      Param1<U[P]>,
      UnsafeReturnType<Param1<U[P]>>
    >
  }

/**
 * This type recursively filters a model down to the properties which
 * represent state - i.e. no actions/selectors etc.
 */
type State<U extends Object> = {
  [P in keyof (Omit<
    U,
    KeysOfType<Pick<U, KeysOfType<U, Object>>, NaturalState | UtilTypes>
  >)]: State<U[P]>
} &
  { [P in keyof Pick<U, KeysOfType<U, NaturalState>>]: U[P] } &
  {
    readonly [P in keyof Pick<
      U,
      KeysOfType<U, Select<any, any>>
    >]: UnsafeReturnType<U[P]>
  } &
  {
    readonly [P in keyof Pick<
      U,
      KeysOfType<U, Reducer<any, any>>
    >]: UnsafeReturnType<U[P]>
  }

type UseStore<TState = any, TReturn = any> = (state: TState) => TReturn

type EffectMeta = {
  path: string[]
  parent: string[]
}

/**
 * Configuration for the createStore
 */
export interface EasyPeasyConfig<
  TInitialState extends Object = {},
  TInjections = void
> {
  compose?: typeof compose
  devTools?: boolean
  initialState?: TInitialState
  injections?: TInjections
  middlewares?: Array<Middleware<any, any, any>>
  reducerEnhancer?: (reducer: Reducer<any, any>) => Reducer<any, any>
}

export type Reducer<
  TState = any,
  TAction extends ReduxAction = AnyAction
> = ReduxReducer<TState>

export type Dispatch<
  TModel,
  A extends ReduxAction = ReduxAction<any>
> = Actions<TModel> & ReduxDispatch<A>

export type Store<TModel> = Overwrite<
  ReduxStore<State<TModel>>,
  {
    dispatch: Dispatch<TModel>
  }
>

/**
 * An effect action type.
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
  TModel extends Object = {},
  TPayload = void,
  TResult = void,
  TInjections = void
> = (
  dispatch: Actions<TModel>,
  payload: TPayload,
  getState: () => State<TModel>,
  injections: TInjections,
  meta: EffectMeta,
) => void | Promise<TResult> | TResult

/**
 * An action type.
 *
 * @example
 *
 * import { Action } from 'easy-peasy';
 *
 * interface Model {
 *   count: number;
 *   increment: Action<Model>;
 * }
 */
export type Action<TModel extends Object = {}, UPayload = void> = (
  state: State<TModel>,
  payload: UPayload,
) => void | State<TModel>

/**
 * A select type.
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
export type Select<TModel extends Object = {}, UResult = void> = (
  state: State<TModel>,
  dependencies?: Array<Select<any, any>>,
) => UResult

/**
 * https://github.com/ctrlplusb/easy-peasy#effectaction
 *
 * @example
 *
 * import { effect } from 'easy-peasy';
 *
 * const login = effect<Model, Credentials>(async (dispatch, payload) => {
 *   const user = await loginService(payload)
 *   dispatch.session.loginSucceeded(user)
 * })
 */
export function effect<
  TModel extends Object = {},
  UPayload = void,
  UResult = void,
  UInjections = void
>(
  effect: Effect<TModel, UPayload, UResult, UInjections>,
): Effect<TModel, UPayload, UResult, UInjections>

/**
 * https://github.com/ctrlplusb/easy-peasy#selectselector
 *
 * @example
 *
 * import { select } from 'easy-peasy';
 *
 * const totalPrice = select<ShoppingBasketModel, number>(state =>
 *   state.products.reduce((acc, cur) => acc + cur.price, 0)
 * );
 */
export function select<TModel extends Object = {}, UResult = void>(
  select: Select<TModel, UResult>,
  dependencies?: Array<Select<any, any>>,
): Select<TModel, UResult>

/**
 * https://github.com/ctrlplusb/easy-peasy#reducerfn
 *
 * @example
 *
 * import { reducer } from 'easy-peasy';
 *
 * const counter = reducer<number>((state = 1, action) => {
 *   switch (action.type) {
 *     case 'INCREMENT': return state + 1;
 *     default: return state;
 *   }
 * });
 */
export function reducer<TState extends Object = {}>(
  state: Reducer<TState>,
): Reducer<TState>

/**
 * https://github.com/ctrlplusb/easy-peasy#createstoremodel-config
 *
 * @example
 *
 * import { createStore } from 'easy-peasy';
 *
 * interface Model {
 *   todos: {
 *     items: Array<string>;
 *   }
 * }
 *
 * const store = createStore<Model>({
 *   todos: {
 *     items: [],
 *   }
 * })
 */
export function createStore<TModel extends Object = {}>(
  model: TModel,
  config?: EasyPeasyConfig,
): Store<TModel>

/**
 * https://github.com/ctrlplusb/easy-peasy#usestoremapstate-externals
 *
 * @example
 *
 * import { useStore } from 'easy-peasy';
 *
 * const todos = useStore<Model, Array<Todo>>(state => state.todos.items);
 *
 * const { totalPrice, netPrice } = useStore<Model, { totalPrice: number, netPrice: number }>(state => ({
 *   totalPrice: state.basket.totalPrice,
 *   netPrice: state.basket.netPrice
 * }));
 */
export function useStore<TModel extends Object = {}, TReturn = any>(
  mapState: UseStore<State<TModel>, TReturn>,
  dependencies?: Array<any>,
): TReturn

/**
 * https://github.com/ctrlplusb/easy-peasy#useactionmapaction
 *
 * @example
 *
 * import { useAction } from 'easy-peasy';
 *
 * const addTodo = useAction<Model, Todo>(dispatch => dispatch.todos.add);
 *
 * addTodo({ id: 1, text: 'foo' });
 */
export function useAction<
  TModel extends Object = {},
  TPayload = void,
  TResult = any
>(
  mapAction: (actions: Actions<TModel>) => ActionCreator<TPayload, TResult>,
): ActionCreator<TPayload, TResult>

/**
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
export class StoreProvider<TModel = any> extends Component<{
  store: Store<TModel>
}> {}
