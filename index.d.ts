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

type EffectMeta = {
  path: string[]
  parent: string[]
}

/**
 * This type recursively filters a model down to the properties which
 * represent actions
 */
export type Actions<Model extends Object> = {
  [P in keyof (Omit<
    Model,
    KeysOfType<Pick<Model, KeysOfType<Model, Object>>, NaturalState | UtilTypes>
  >)]: Actions<Model[P]>
} &
  {
    [P in keyof Pick<Model, KeysOfType<Model, ActionTypes>>]: Param1<
      Model[P]
    > extends void
      ? () => UnsafeReturnType<Model[P]>
      : (payload: Param1<Model[P]>) => UnsafeReturnType<Model[P]>
  }

/**
 * This type recursively filters a model down to the properties which
 * represent state - i.e. no actions/selectors etc.
 */
export type State<Model extends Object> = {
  [P in keyof (Omit<
    Model,
    KeysOfType<Pick<Model, KeysOfType<Model, Object>>, NaturalState | UtilTypes>
  >)]: State<Model[P]>
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
 * Configuration for the createStore
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

export type Reducer<
  State = any,
  Action extends ReduxAction = AnyAction
> = ReduxReducer<State>

export type Dispatch<
  Model,
  Action extends ReduxAction = ReduxAction<any>
> = Actions<Model> & ReduxDispatch<Action>

export type Store<Model> = Overwrite<
  ReduxStore<State<Model>>,
  {
    dispatch: Dispatch<Model>
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
  Model extends Object = {},
  Payload = void,
  Result = void,
  Injections = void
> = (
  dispatch: Actions<Model>,
  payload: Payload,
  getState: () => State<Model>,
  injections: Injections,
  meta: EffectMeta,
) => Result

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
export type Action<Model extends Object = {}, Payload = void> = (
  state: State<Model>,
  payload: Payload,
) => void | State<Model>

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
export type Select<Model extends Object = {}, Result = void> = (
  state: State<Model>,
  dependencies?: Array<Select<any, any>>,
) => Result

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
  Model extends Object = {},
  Payload = void,
  Result = void,
  Injections = void
>(
  effect: Effect<Model, Payload, Result, Injections>,
): Effect<Model, Payload, Result, Injections>

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
export function select<Model extends Object = {}, Result = void>(
  select: Select<Model, Result>,
  dependencies?: Array<Select<any, any>>,
): Select<Model, Result>

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
export function reducer<State extends Object = {}>(
  state: Reducer<State>,
): Reducer<State>

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
export function createStore<Model extends Object = {}>(
  model: Model,
  config?: EasyPeasyConfig,
): Store<Model>

/**
 * https://github.com/ctrlplusb/easy-peasy#usestoremapstate-externals
 *
 * @example
 *
 * import { useStore } from 'easy-peasy';
 *
 * const todos = useStore((state: State<Model>) => state.todos.items);
 *
 * const { totalPrice, netPrice } = useStore((state: State<Model>) => ({
 *   totalPrice: state.basket.totalPrice,
 *   netPrice: state.basket.netPrice
 * }));
 */
export function useStore<Model extends Object = {}, Result = any>(
  mapState: (state: State<Model>) => Result,
  dependencies?: Array<any>,
): Result

/**
 * https://github.com/ctrlplusb/easy-peasy#useactionmapaction
 *
 * @example
 *
 * import { useAction } from 'easy-peasy';
 *
 * const addTodo = useAction((dispatch: Dispatch<Todo>) => dispatch.todos.add);
 *
 * addTodo({ id: 1, text: 'foo' });
 */
export function useAction<
  Model extends Object = {},
  Payload = any,
  Result = any
>(mapAction: (actions: Dispatch<Model>) => Result): Result

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
export class StoreProvider<Model = any> extends Component<{
  store: Store<Model>
}> {}
