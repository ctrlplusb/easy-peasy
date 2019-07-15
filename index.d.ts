/* eslint-disable */

import { Component } from 'react';
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
import { O } from 'ts-toolbelt';

/**
 * Picks only the keys of a certain type
 */
type KeysOfType<A extends object, B> = {
  [K in keyof A]-?: A[K] extends B ? K : never;
}[keyof A];

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

type ActionTypes =
  | Action<any, any>
  | Thunk<any, any, any, any, any>
  | ActionOn<any, any, any>
  | ThunkOn<any, any, any, any, any>;

interface ActionCreator<Payload> {
  (payload: Payload): void;
  type: string;
  z__creator: 'actionWithPayload';
}

interface ThunkCreator<Payload, Result> {
  (payload: Payload): Result;
  type: string;
  startType: string;
  successType: string;
  failType: string;
  z__creator: 'thunkWithPayload';
}

type ActionOrThunkCreator<Payload = void, Result = void> =
  | ActionCreator<Payload>
  | ThunkCreator<Payload, Result>;

// #region Helpers

export function debug<StateDraft extends any>(state: StateDraft): StateDraft;

export function memo<Fn extends Function = any>(fn: Fn, cacheSize: number): Fn;

// #endregion

// #region Actions

type ActionMapper<ActionsModel extends object, Depth extends string> = {
  [P in keyof ActionsModel]: ActionsModel[P] extends ActionOn<any, any, any>
    ? ActionCreator<ListenerTarget<ActionsModel[P]['payload']>>
    : ActionsModel[P] extends ThunkOn<any, any, any, any, any>
    ? ThunkCreator<
        ListenerTarget<ActionsModel[P]['payload']>,
        ActionsModel[P]['result']
      >
    : ActionsModel[P] extends Thunk<any, any, any, any, any>
    ? ActionsModel[P]['payload'] extends void
      ? ThunkCreator<void, Promise<ActionsModel[P]['result']>>
      : ThunkCreator<
          ActionsModel[P]['payload'],
          Promise<ActionsModel[P]['result']>
        >
    : ActionsModel[P] extends Action<any, any>
    ? ActionsModel[P]['payload'] extends void
      ? ActionCreator<void>
      : ActionCreator<ActionsModel[P]['payload']>
    : ActionsModel[P] extends object
    ? RecursiveActions<
        ActionsModel[P],
        Depth extends '1'
          ? '2'
          : Depth extends '2'
          ? '3'
          : Depth extends '3'
          ? '4'
          : Depth extends '4'
          ? '5'
          : '6'
      >
    : unknown;
};

type RecursiveActions<
  Model extends Object,
  Depth extends string
> = Depth extends '6'
  ? Model
  : ActionMapper<
      O.Filter<
        O.Select<Model, object>,
        | Array<any>
        | RegExp
        | Date
        | Reducer<any, any>
        | Computed<any, any, any, any>
      >,
      Depth
    >;

/**
 * Filters a model into a type that represents the actions (and effects) only
 *
 * @example
 *
 * type OnlyActions = Actions<Model>;
 */
export type Actions<Model extends Object> = RecursiveActions<Model, '1'>;

// #endregion

// #region State

type StateMapper<StateModel extends object, Depth extends string> = {
  [P in keyof StateModel]: StateModel[P] extends Computed<any, any, any, any>
    ? StateModel[P]['result']
    : StateModel[P] extends Reducer<any, any>
    ? StateModel[P]['result']
    : StateModel[P] extends object
    ? StateModel[P] extends string | Array<any> | RegExp | Date | Function
      ? StateModel[P]
      : RecursiveState<
          StateModel[P],
          Depth extends '1'
            ? '2'
            : Depth extends '2'
            ? '3'
            : Depth extends '3'
            ? '4'
            : Depth extends '4'
            ? '5'
            : '6'
        >
    : StateModel[P];
};

type RecursiveState<
  Model extends object,
  Depth extends string
> = Depth extends '6'
  ? Model
  : O.Merge<
      StateMapper<
        O.Omit<O.Filter<Model, ActionTypes>, IndexSignatureKeysOfType<Model>>,
        Depth
      >,
      O.Pick<Model, IndexSignatureKeysOfType<Model>>
    >;

/**
 * Filters a model into a type that represents the state only (i.e. no actions)
 *
 * @example
 *
 * type StateOnly = State<Model>;
 */
export type State<Model extends object> = RecursiveState<Model, '1'>;

// #endregion

// #region Store + Config + Creation

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

export interface MockedAction {
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
  StoreModel extends object,
  StoreConfig extends EasyPeasyConfig<any, any> = any
> = O.Merge<
  O.Omit<ReduxStore<State<StoreModel>>, 'dispatch'>,
  {
    addModel: <ModelSlice extends object>(
      key: string,
      modelSlice: ModelSlice,
    ) => void;
    clearMockedActions: () => void;
    dispatch: Dispatch<StoreModel>;
    getActions: () => Actions<StoreModel>;
    getMockedActions: () => MockedAction[];
    reconfigure: <NewStoreModel extends object>(model: NewStoreModel) => void;
    removeModel: (key: string) => void;
  }
>;

// #endregion

// #region Dispatch

/**
 * Enhanced version of the Redux Dispatch with action creators bound to it
 *
 * @example
 *
 * type DispatchWithActions = Dispatch<StoreModel>;
 */
export type Dispatch<
  StoreModel,
  Action extends ReduxAction = ReduxAction<any>
> = Actions<StoreModel> & ReduxDispatch<Action>;

// #endregion

// #region Types for actionOn/thunkOn resolveTargets

type Target = ActionOrThunkCreator<any> | string;

type TargetResolver<Model extends object, StoreModel extends object> = (
  actions: Actions<Model>,
  storeActions: Actions<StoreModel>,
) => Target | Array<Target>;

interface ListenerTarget<Payload> {
  type: string;
  payload: Payload;
  result?: any;
  error?: Error;
  resolvedTargets: Array<string>;
}

type PayloadFromResolved<
  Resolver extends TargetResolver<any, any>,
  ExplicitPayload = unknown,
  Resolved = ReturnType<Resolver>
> = Resolved extends string
  ? ExplicitPayload extends unknown
    ? boolean
    : ExplicitPayload
  : Resolved extends ActionOrThunkCreator<infer Payload>
  ? Payload
  : Resolved extends Array<infer T>
  ? T extends string
    ? ExplicitPayload extends unknown
      ? any
      : ExplicitPayload
    : T extends ActionOrThunkCreator<infer Payload>
    ? Payload
    : T
  : unknown;

// #endregion

// #region Thunk

type Meta = {
  path: string[];
  parent: string[];
};

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
  Model extends object = {},
  Payload = void,
  Injections = any,
  StoreModel extends object = {},
  Result = any
> = {
  type: 'thunk';
  payload: Payload;
  result: Result;
};

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
  Model extends object = {},
  Payload = void,
  Injections = any,
  StoreModel extends object = {},
  Result = any
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
): Thunk<Model, Payload, Injections, StoreModel, Result>;

// #endregion

// #region Listener Thunk

export interface ThunkOn<
  Model extends object = {},
  Payload = unknown,
  Injections = any,
  StoreModel extends object = {},
  Result = any
> {
  type: 'thunkOn';
  payload: Payload;
  result: Result;
}

export function thunkOn<
  Model extends object = {},
  Payload = unknown,
  Injections = any,
  StoreModel extends object = {},
  Result = any,
  Resolved extends TargetResolver<Model, StoreModel> = TargetResolver<
    Model,
    StoreModel
  >
>(
  targetResolver: Resolved,
  handler: (
    actions: Actions<Model>,
    target: ListenerTarget<PayloadFromResolved<Resolved, Payload>>,
    helpers: {
      dispatch: Dispatch<StoreModel>;
      getState: () => State<Model>;
      getStoreActions: () => Actions<StoreModel>;
      getStoreState: () => State<StoreModel>;
      injections: Injections;
      meta: Meta;
    },
  ) => Result,
): ThunkOn<Model, Payload, Injections, StoreModel, Result>;

// #endregion

// #region Action

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
export type Action<Model extends object = {}, Payload = void> = {
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
export function action<Model extends object = {}, Payload = any>(
  action: (state: State<Model>, payload: Payload) => void | State<Model>,
): Action<Model, Payload>;

// #endregion

// #region Listener Action

export interface ActionOn<
  Model extends object = {},
  Payload = void,
  StoreModel extends object = {}
> {
  type: 'actionOn';
  payload: Payload;
  result: void | State<Model>;
}

export function actionOn<
  Model extends object = {},
  Payload = any,
  StoreModel extends object = {},
  Target extends ListenerTarget<Payload> = ListenerTarget<Payload>,
  Resolver extends TargetResolver<Model, StoreModel> = TargetResolver<
    Model,
    StoreModel
  >
>(
  targetResolver: Resolver,
  handler: (state: State<Model>, target: Target) => void | State<Model>,
): ActionOn<Model, Payload, StoreModel>;

// #endregion

// #region Computed

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
  Model extends object = {},
  Result = any,
  ResolvedState extends ResolvedStates | void = void,
  StoreModel extends object = {}
> = {
  type: 'computed';
  result: Result;
};

export function computed<
  Model extends object = {},
  Result = any,
  ResolvedState extends ResolvedStates | void = void,
  StoreModel extends object = {}
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

// #endregion

// #region Reducer

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
export function reducer<State = any>(
  state: ReduxReducer<State>,
): Reducer<State>;

// #endregion

// #region Hooks

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
export function useStoreActions<
  StoreActions extends Actions<any> = {},
  Result = any
>(mapActions: (actions: StoreActions) => Result): Result;

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
export function useStoreDispatch<StoreModel extends object = {}>(): Dispatch<
  StoreModel
>;

/**
 * A utility function used to create pre-typed hooks.
 *
 * @example
 * const { useStoreActions, useStoreState, useStoreDispatch } = createTypedHooks<StoreModel>();
 *
 * useStoreActions(actions => actions.todo.add); // fully typed
 */
export function createTypedHooks<StoreModel extends Object = {}>(): {
  useStoreActions: <Result = any>(
    mapActions: (actions: Actions<StoreModel>) => Result,
  ) => Result;
  useStoreDispatch: () => Dispatch<StoreModel>;
  useStoreState: <Result = any>(
    mapState: (state: State<StoreModel>) => Result,
    dependencies?: Array<any>,
  ) => Result;
};

// #endregion

// #region StoreProvider

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
export class StoreProvider<StoreModel extends object = any> extends Component<{
  store: Store<StoreModel>;
}> {}

// #endregion

// #region Context + Local Stores

interface StoreModelInitializer<
  StoreModel extends object = {},
  InitialData = any
> {
  (initialData?: InitialData): StoreModel;
}

export function createContextStore<
  StoreModel extends object = {},
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
  StoreModel extends object = {},
  InitialData = any
> {
  (initialData?: InitialData): [State<StoreModel>, Actions<StoreModel>];
}

export function createComponentStore<
  StoreModel extends object = {},
  InitialData = any,
  StoreConfig extends EasyPeasyConfig<any, any> = any
>(
  model: StoreModel | StoreModelInitializer<StoreModel, InitialData>,
  config?: StoreConfig,
): UseLocalStore<StoreModel, InitialData>;

// #endregion
