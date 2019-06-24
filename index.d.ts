/* eslint-disable */

import { Component } from 'react';
import {
  Diff,
  KeysOfType,
  Omit,
  OptionalKeys,
  Overwrite,
  RequiredKeys,
} from 'typelevel-ts';
import { Param0, Param1 } from 'type-zoo';
import {
  compose,
  AnyAction,
  Action as ReduxAction,
  Dispatch as ReduxDispatch,
  Reducer as ReduxReducer,
  Store as ReduxStore,
  StoreEnhancer,
  Middleware,
} from 'redux';
import { string } from 'prop-types';

/**
 * This allows you to narrow keys of an object type that are index signature
 * based.
 *
 * Based on answer from here:
 * https://stackoverflow.com/questions/56422807/narrowing-a-type-to-its-properties-that-are-index-signatures/56423972#56423972
 */
type IndexSignatureKeysOfType<A extends Object> = {
  [K in keyof A]: A[K] extends ({ [key: string]: any } | { [key: number]: any })
    ? string extends keyof A[K]
      ? K
      : number extends keyof A[K]
      ? K
      : never
    : never;
}[keyof A];

type ActionTypes = Action<any, any> | Thunk<any, any, any, any, any>;

type Meta = {
  path: string[];
  parent: string[];
};

export function debug<StateDraft extends any>(state: StateDraft): StateDraft;

export function actionName(action: Action<any, any>): string;

export function thunkStartName(action: Thunk<any, any, any, any, any>): string;

export function thunkCompleteName(
  action: Thunk<any, any, any, any, any>,
): string;

export function thunkFailName(action: Thunk<any, any, any, any, any>): string;

type FilterActionTypes<T extends object> = Omit<
  T,
  KeysOfType<
    T,
    | Array<any>
    | Date
    | RegExp
    | Reducer<any, any>
    | Computed<any, any, any, any>
  >
>;

type FilterStateTypes<T extends object> = Overwrite<
  Omit<T, KeysOfType<T, Action<any, any> | Thunk<any, any, any, any, any>>>,
  Pick<T, KeysOfType<T, Reducer<any, any>>>
>;

/**
 * Filters a model into a type that represents the actions (and effects) only
 *
 * @example
 *
 * type OnlyActions = Actions<Model>;
 */
export type Actions<Model extends Object> = {
  [P in keyof Overwrite<
    FilterActionTypes<Pick<Model, KeysOfType<Model, object>>>,
    Pick<Model, KeysOfType<Model, ActionTypes>>
  >]: Model[P] extends Thunk<any, any, any, any, infer R>
    ? Param1<Model[P]> extends void
      ? () => R extends Promise<any> ? R : Promise<R>
      : (payload: Param1<Model[P]>) => R extends Promise<any> ? R : Promise<R>
    : Model[P] extends Action<any, any>
    ? Param1<Model[P]> extends void
      ? () => void
      : (payload: Param1<Model[P]>) => void
    : Model[P] extends object
    ? Actions<Model[P]>
    : unknown;
};

type RequiredOnly<Model extends Object> = Pick<Model, RequiredKeys<Model>>;
type OptionalOnly<Model extends Object> = Pick<Model, OptionalKeys<Model>>;

type StateModelValues<
  Model extends Object,
  P extends keyof Model
> = Model[P] extends Computed<any, infer R, any, any>
  ? R
  : Model[P] extends Reducer<infer R, any>
  ? R
  : Model[P] extends object
  ? Model[P] extends Array<any> | RegExp | Date | Function
    ? Model[P]
    : State<Model[P]>
  : Model[P];

type RecursiveState<
  OtherModel extends Object,
  RequiredModel extends Object,
  OptionalModel extends Object
> = Overwrite<
  Overwrite<
    { [P in keyof RequiredModel]: StateModelValues<RequiredModel, P> },
    { [P in keyof OptionalModel]?: StateModelValues<OptionalModel, P> }
  >,
  { [P in keyof OtherModel]: OtherModel[P] }
>;

type FilterIndexSignatures<
  StateModel extends Object,
  RequiredStateModel extends Object,
  OptionalStateModel extends Object
> = RecursiveState<
  StateModel,
  Omit<RequiredStateModel, keyof StateModel>,
  Omit<OptionalStateModel, keyof StateModel>
>;

/**
 * Filters a model into a type that represents the state only (i.e. no actions)
 *
 * @example
 *
 * type StateOnly = State<Model>;
 */
export type State<Model extends Object> = FilterIndexSignatures<
  Pick<Model, IndexSignatureKeysOfType<Model>>,
  FilterStateTypes<RequiredOnly<Model>>,
  FilterStateTypes<OptionalOnly<Model>>
>;

/**
 * Configuration interface for the createStore
 */
export interface EasyPeasyConfig<
  InitialState extends Object = {},
  Injections = any
> {
  compose?: typeof compose;
  devTools?: boolean;
  enhancers?: StoreEnhancer[];
  initialState?: InitialState;
  injections?: Injections;
  middleware?: Array<Middleware<any, any, any>>;
  mockActions?: boolean;
  name?: string;
  reducerEnhancer?: (reducer: Reducer<any, any>) => Reducer<any, any>;
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
> = Actions<StoreModel> & ReduxDispatch<Action>;

export interface ActionData {
  type: string;
  [key: string]: any;
}

/**
 * Represents a Redux store, enhanced by easy peasy.
 *
 * @example
 *
 * type EnhancedReduxStore = Store<StoreModel>;
 */
export type Store<
  StoreModel,
  StoreConfig extends EasyPeasyConfig<any, any> = any
> = Overwrite<
  ReduxStore<State<StoreModel>>,
  {
    dispatch: Dispatch<StoreModel>;
    getActions: () => Actions<StoreModel>;
    getMockedActions: () => ActionData[];
    clearMockedActions: () => void;
    useStoreActions: <Result = any>(
      mapActions: (actions: Actions<StoreModel>) => Result,
    ) => Result;
    useStoreDispatch: () => Dispatch<StoreModel>;
    useStoreState: <Result = any>(
      mapState: (state: State<StoreModel>) => Result,
      dependencies?: Array<any>,
    ) => Result;
  }
>;

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
 *   addTodo: Thunk<TodosModel, string>;
 * }
 */
export type Thunk<
  Model extends Object = {},
  Payload = void,
  Injections = any,
  StoreModel extends Object = {},
  Result = any
> = {
  (
    actions: Actions<Model>,
    payload: Payload,
    helpers: {
      dispatch: Dispatch<StoreModel>;
      getState: () => State<Model>;
      getStoreActions: () => Actions<StoreModel>;
      getStoreState: () => State<StoreModel>;
      injections: Injections;
      meta: Meta;
    },
  ): Result;
  type: 'thunk';
  payload: Payload;
  result: Result;
};

type Target<TargetPayload> =
  | Action<any, TargetPayload>
  | Thunk<any, TargetPayload>
  | string
  | void;

type ListenToTarget<TargetPayload> =
  | Target<TargetPayload>
  | Array<Target<TargetPayload>>;

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
  Injections = any,
  StoreModel extends Object = {},
  Result = any,
  ListenTo extends ListenToTarget<Payload> = void
>(
  thunk: (
    actions: Actions<Model>,
    payload: Payload,
    helpers: {
      dispatch: Dispatch<StoreModel>;
      getState: () => State<Model>;
      getStoreActions: () => Actions<StoreModel>;
      getStoreState: () => State<StoreModel>;
      injections: Injections;
      meta: Meta;
    },
  ) => Result,
  config?: { listenTo?: ListenTo },
): Thunk<Model, Payload, Injections, StoreModel, Result>;

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
 *   todos: Array<Todo>;
 *   addTodo: Action<Model, Todo>;
 * }
 */
export type Action<Model extends Object = {}, Payload = void> = {
  (state: State<Model>, payload: Payload): void | State<Model>;
  type: 'action';
  payload: Payload;
  result: void | State<Model>;
};

/**
 * Declares an action type against your model.
 *
 * https://github.com/ctrlplusb/easy-peasy#action
 *
 * @example
 *
 * import { action } from 'easy-peasy';
 *
 * const store = createStore({
 *   count: 0,
 *   increment: action((state)) => {
 *    state.count += 1;
 *   })
 * });
 */
export function action<
  Model extends Object = {},
  Payload = any,
  ListenTo extends ListenToTarget<Payload> = void
>(
  action: (state: State<Model>, payload: Payload) => void | State<Model>,
  config?: {
    listenTo?: ListenTo;
  },
): Action<Model, Payload>;

type StateResolver<
  Model extends {},
  StoreModel extends {},
  Result extends any
> = (state: State<Model>, storeState: State<StoreModel>) => Result;

type StateResolvers1<Model, StoreModel, Arg1> = [
  StateResolver<Model, StoreModel, Arg1>,
];

type StateResolvers2<Model, StoreModel, Arg1, Arg2> = [
  StateResolver<Model, StoreModel, Arg1>,
  StateResolver<Model, StoreModel, Arg2>,
];

type StateResolvers3<Model, StoreModel, Arg1, Arg2, Arg3> = [
  StateResolver<Model, StoreModel, Arg1>,
  StateResolver<Model, StoreModel, Arg2>,
  StateResolver<Model, StoreModel, Arg3>,
];

type StateResolvers4<Model, StoreModel, Arg1, Arg2, Arg3, Arg4> = [
  StateResolver<Model, StoreModel, Arg1>,
  StateResolver<Model, StoreModel, Arg2>,
  StateResolver<Model, StoreModel, Arg3>,
  StateResolver<Model, StoreModel, Arg4>,
];

type StateResolvers5<Model, StoreModel, Arg1, Arg2, Arg3, Arg4, Arg5> = [
  StateResolver<Model, StoreModel, Arg1>,
  StateResolver<Model, StoreModel, Arg2>,
  StateResolver<Model, StoreModel, Arg3>,
  StateResolver<Model, StoreModel, Arg4>,
  StateResolver<Model, StoreModel, Arg5>,
];

export type ResolvedState1<Arg1> = [Arg1];
export type ResolvedState2<Arg1, Arg2> = [Arg1, Arg2];
export type ResolvedState3<Arg1, Arg2, Arg3> = [Arg1, Arg2, Arg3];
export type ResolvedState4<Arg1, Arg2, Arg3, Arg4> = [Arg1, Arg2, Arg3, Arg4];
export type ResolvedState5<Arg1, Arg2, Arg3, Arg4, Arg5> = [
  Arg1,
  Arg2,
  Arg3,
  Arg4,
  Arg5,
];

type ResolvedStates =
  | ResolvedState1<any>
  | ResolvedState2<any, any>
  | ResolvedState3<any, any, any>
  | ResolvedState4<any, any, any, any>
  | ResolvedState5<any, any, any, any, any>;

/**
 * A computed type.
 *
 * Useful when declaring your model.
 *
 * @example
 *
 * import { Computed } from 'easy-peasy';
 *
 * interface Model {
 *   products: Array<Product>;
 *   totalPrice: Computed<Model, number>;
 * }
 */
export type Computed<
  Model extends Object = {},
  Result = any,
  ResolvedState extends ResolvedStates | void = void,
  StoreModel extends Object = {}
> = {
  (
    ...args: ResolvedState extends ResolvedStates
      ? ResolvedState
      : [State<Model>]
  ): Result;
  type: 'computed';
  result: Result;
};

export function computed<
  Model extends Object = {},
  Result = any,
  ResolvedState extends ResolvedStates | void = void,
  StoreModel extends Object = {}
>(
  computationFunc: (
    ...args: ResolvedState extends ResolvedStates
      ? ResolvedState
      : [State<Model>]
  ) => Result,
  stateResolvers?: ResolvedState extends ResolvedStates
    ? ResolvedState extends ResolvedState1<infer Arg1>
      ? StateResolvers1<Model, StoreModel, Arg1>
      : ResolvedState extends ResolvedState2<infer Arg1, infer Arg2>
      ? StateResolvers2<Model, StoreModel, Arg1, Arg2>
      : ResolvedState extends ResolvedState3<infer Arg1, infer Arg2, infer Arg3>
      ? StateResolvers3<Model, StoreModel, Arg1, Arg2, Arg3>
      : ResolvedState extends ResolvedState4<
          infer Arg1,
          infer Arg2,
          infer Arg3,
          infer Arg4
        >
      ? StateResolvers4<Model, StoreModel, Arg1, Arg2, Arg3, Arg4>
      : ResolvedState extends ResolvedState5<
          infer Arg1,
          infer Arg2,
          infer Arg3,
          infer Arg4,
          infer Arg5
        >
      ? StateResolvers5<Model, StoreModel, Arg1, Arg2, Arg3, Arg4, Arg5>
      : StateResolver<Model, StoreModel, any>[]
    : void,
): Computed<Model, Result, ResolvedState, StoreModel>;

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
export type Reducer<State = any, Action extends ReduxAction = AnyAction> = {
  (state: State, action: Action): State;
  type: 'reducer';
  result: State;
};

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
  state: ReduxReducer<State>,
): Reducer<State>;

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
export function createStore<
  StoreModel extends Object = {},
  StoreConfig extends EasyPeasyConfig<any, any> = any
>(model: StoreModel, config?: StoreConfig): Store<StoreModel, StoreConfig>;

/**
 * A React Hook allowing you to use state within your component.
 *
 * https://github.com/ctrlplusb/easy-peasy#usestoremapstate-externals
 *
 * @example
 *
 * import { useStoreState, State } from 'easy-peasy';
 *
 * function MyComponent() {
 *   const todos = useStoreState((state: State<StoreModel>) => state.todos.items);
 *   return todos.map(todo => <Todo todo={todo} />);
 * }
 */
export function useStoreState<StoreState extends State<any> = {}, Result = any>(
  mapState: (state: StoreState) => Result,
  dependencies?: Array<any>,
): Result;

/**
 * A React Hook allowing you to use actions within your component.
 *
 * https://github.com/ctrlplusb/easy-peasy#useactionsmapactions
 *
 * @example
 *
 * import { useStoreActions, Actions } from 'easy-peasy';
 *
 * function MyComponent() {
 *   const addTodo = useStoreActions((actions: Actions<StoreModel>) => actions.todos.add);
 *   return <AddTodoForm save={addTodo} />;
 * }
 */
export function useStoreActions<StoreModel extends Object = {}, Result = any>(
  mapActions: (actions: Actions<StoreModel>) => Result,
): Result;

/**
 * A React Hook allowing you to use the store's dispatch within your component.
 *
 * https://github.com/ctrlplusb/easy-peasy#usedispatch
 *
 * @example
 *
 * import { useStoreDispatch } from 'easy-peasy';
 *
 * function MyComponent() {
 *   const dispatch = useStoreDispatch();
 *   return <AddTodoForm save={(todo) => dispatch({ type: 'ADD_TODO', payload: todo })} />;
 * }
 */
export function useStoreDispatch<StoreModel extends Object = {}>(): Dispatch<
  StoreModel
>;

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
  store: Store<StoreModel>;
}> {}

interface StoreModelInitializer<
  StoreModel extends Object = {},
  InitialData = any
> {
  (initialData?: InitialData): StoreModel;
}

export function createContextStore<
  StoreModel extends Object = {},
  InitialData = any,
  StoreConfig extends EasyPeasyConfig<any, any> = any
>(
  model: StoreModel | StoreModelInitializer<StoreModel, InitialData>,
  config?: StoreConfig,
): {
  Provider: React.SFC<{ initialData?: InitialData }>;
  useStore: () => Store<StoreModel, StoreConfig>;
  useStoreState: <Result = any>(
    mapState: (state: State<StoreModel>) => Result,
    dependencies?: Array<any>,
  ) => Result;
  useStoreActions: <Result = any>(
    mapActions: (actions: Actions<StoreModel>) => Result,
  ) => Result;
  useStoreDispatch: () => Dispatch<StoreModel>;
};

export interface UseLocalStore<
  StoreModel extends Object = {},
  InitialData = any
> {
  (initialData?: InitialData): [State<StoreModel>, Actions<StoreModel>];
}

export function createComponentStore<
  StoreModel extends Object = {},
  InitialData = any,
  StoreConfig extends EasyPeasyConfig<any, any> = any
>(
  model: StoreModel | StoreModelInitializer<StoreModel, InitialData>,
  config?: StoreConfig,
): UseLocalStore<StoreModel, InitialData>;

export function memo<Fn extends Function = any>(fn: Fn, cacheSize: number): Fn;
