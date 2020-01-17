/// <reference types="symbol-observable" />

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
  Observable,
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
  [K in keyof A]: A[K] extends { [key: string]: any } | { [key: number]: any }
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
  | ActionOn<any, any>
  | ThunkOn<any, any, any>;

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

// #region Listeners

type ListenerMapper<ActionsModel extends object, Depth extends string> = {
  [P in keyof ActionsModel]: ActionsModel[P] extends ActionOn<any, any>
    ? ActionCreator<TargetPayload<any>>
    : ActionsModel[P] extends ThunkOn<any, any, any>
    ? ThunkCreator<TargetPayload<any>, any>
    : ActionsModel[P] extends object
    ? RecursiveListeners<
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

type RecursiveListeners<
  Model extends object,
  Depth extends string
> = Depth extends '6'
  ? Model
  : ListenerMapper<
      O.Filter<
        O.Select<Model, object>,
        | Array<any>
        | RegExp
        | Date
        | string
        | Reducer<any, any>
        | Computed<any, any, any>
        | Action<any, any>
        | Thunk<any, any, any, any, any>
      >,
      Depth
    >;

/**
 * Filters a model into a type that represents the listeners action creators
 *
 * @example
 *
 * type OnlyActions = Actions<Model>;
 */
export type Listeners<Model extends object = {}> = RecursiveListeners<
  Model,
  '1'
>;

// #endregion

// #region Actions

type ActionMapper<ActionsModel extends object, Depth extends string> = {
  [P in keyof ActionsModel]: ActionsModel[P] extends Action<any, any>
    ? ActionCreator<ActionsModel[P]['payload']>
    : ActionsModel[P] extends Thunk<any, any, any, any, any>
    ? ActionsModel[P]['payload'] extends void
      ? ThunkCreator<void, ActionsModel[P]['result']>
      : ThunkCreator<ActionsModel[P]['payload'], ActionsModel[P]['result']>
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
  Model extends object,
  Depth extends string
> = Depth extends '6'
  ? Model
  : ActionMapper<
      O.Filter<
        O.Select<Model, object>,
        | Array<any>
        | RegExp
        | Date
        | string
        | Reducer<any, any>
        | Computed<any, any, any>
        | ActionOn<any, any>
        | ThunkOn<any, any, any>
      >,
      Depth
    >;

/**
 * Filters a model into a type that represents the action/thunk creators
 *
 * @example
 *
 * type OnlyActions = Actions<Model>;
 */
export type Actions<Model extends object = {}> = RecursiveActions<Model, '1'>;

// #endregion

// #region State

type StateMapper<StateModel extends object, Depth extends string> = {
  [P in keyof StateModel]: P extends IndexSignatureKeysOfType<StateModel>
    ? StateModel[P]
    : StateModel[P] extends Computed<any, any, any>
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
  : StateMapper<O.Filter<Model, ActionTypes>, Depth>;

/**
 * Filters a model into a type that represents the state only (i.e. no actions)
 *
 * @example
 *
 * type StateOnly = State<Model>;
 */
export type State<Model extends object = {}> = RecursiveState<Model, '1'>;

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
  InitialState extends object = {},
  Injections = any
>(
  model: StoreModel,
  config?: EasyPeasyConfig<InitialState, Injections>,
): Store<StoreModel, EasyPeasyConfig<InitialState, Injections>>;

/**
 * Configuration interface for the createStore
 */
export interface EasyPeasyConfig<
  InitialState extends Object = {},
  Injections = any
> {
  compose?: typeof compose;
  devTools?: boolean;
  disableImmer?: boolean;
  enhancers?: StoreEnhancer[];
  initialState?: InitialState;
  injections?: Injections;
  middleware?: Array<Middleware<any, any, any>>;
  mockActions?: boolean;
  name?: string;
  reducerEnhancer?: (reducer: ReduxReducer<any, any>) => ReduxReducer<any, any>;
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
export interface Store<
  StoreModel extends object = {},
  StoreConfig extends EasyPeasyConfig<any, any> = any
> extends ReduxStore<State<StoreModel>> {
  addModel: <ModelSlice extends object>(
    key: string,
    modelSlice: ModelSlice,
  ) => void;
  clearMockedActions: () => void;
  dispatch: Dispatch<StoreModel>;
  getActions: () => Actions<StoreModel>;
  getListeners: () => Listeners<StoreModel>;
  getMockedActions: () => MockedAction[];
  reconfigure: <NewStoreModel extends object>(model: NewStoreModel) => void;
  removeModel: (key: string) => void;

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */
  [Symbol.observable](): Observable<State<StoreModel>>;
}

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
  StoreModel extends object = {},
  Action extends ReduxAction = ReduxAction<any>
> = Actions<StoreModel> & ReduxDispatch<Action>;

// #endregion

// #region Types shared by ActionOn and ThunkOn

type Target = ActionOrThunkCreator<any> | string;

type TargetResolver<Model extends object, StoreModel extends object> = (
  actions: Actions<Model>,
  storeActions: Actions<StoreModel>,
) => Target | Array<Target>;

interface TargetPayload<Payload> {
  type: string;
  payload: Payload;
  result?: any;
  error?: Error;
  resolvedTargets: Array<string>;
}

type PayloadFromResolver<
  Resolver extends TargetResolver<any, any>,
  Resolved = ReturnType<Resolver>
> = Resolved extends string
  ? any
  : Resolved extends ActionOrThunkCreator<infer Payload>
  ? Payload
  : Resolved extends Array<infer T>
  ? T extends string
    ? any
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
  Injections = any,
  StoreModel extends object = {}
> {
  type: 'thunkOn';
}

export function thunkOn<
  Model extends object = {},
  Injections = any,
  StoreModel extends object = {},
  Resolver extends TargetResolver<Model, StoreModel> = TargetResolver<
    Model,
    StoreModel
  >
>(
  targetResolver: Resolver,
  handler: (
    actions: Actions<Model>,
    target: TargetPayload<PayloadFromResolver<Resolver>>,
    helpers: {
      dispatch: Dispatch<StoreModel>;
      getState: () => State<Model>;
      getStoreActions: () => Actions<StoreModel>;
      getStoreState: () => State<StoreModel>;
      injections: Injections;
      meta: Meta;
    },
  ) => any,
): ThunkOn<Model, Injections, StoreModel>;

// #endregion

// #region Action

/**
 * Represents an action.
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
 * Declares an action.
 *
 * https://easy-peasy.now.sh/docs/api/action
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
  StoreModel extends object = {}
> {
  type: 'actionOn';
  result: void | State<Model>;
}

export function actionOn<
  Model extends object,
  StoreModel extends object,
  Resolver extends TargetResolver<Model, StoreModel>
>(
  targetResolver: Resolver,
  handler: (
    state: State<Model>,
    target: TargetPayload<PayloadFromResolver<Resolver>>,
  ) => void | State<Model>,
): ActionOn<Model, StoreModel>;

// #endregion

// #region Computed

/**
 * Represents a computed property.
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
  StoreModel extends object = {}
> = {
  type: 'computed';
  result: Result;
};

type Resolver<Model extends object, StoreModel extends object> = (
  state: State<Model>,
  storeState: State<StoreModel>,
) => any;

type DefaultComputationFunc<Model extends object, Result> = (
  state: State<Model>,
) => Result;

export function computed<
  Model extends object,
  Result,
  StoreModel extends object,
  Resolvers extends Resolver<Model, StoreModel>[]
>(
  resolversOrCompFunc: (Resolvers | []) | DefaultComputationFunc<Model, Result>,
  compFunc?: (
    ...args: {
      [K in keyof Resolvers]: Resolvers[K] extends (...args: any[]) => any
        ? ReturnType<Resolvers[K]>
        : string;
    }
  ) => Result,
): Computed<Model, Result, StoreModel>;

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
export function reducer<State>(state: ReduxReducer<State>): Reducer<State>;

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
export function useStoreState<StoreState extends State<any>, Result>(
  mapState: (state: StoreState) => Result,
  equalityFn?: (prev: Result, next: Result) => boolean,
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
export function useStoreActions<StoreActions extends Actions<any>, Result>(
  mapActions: (actions: StoreActions) => Result,
): Result;

/**
 * A react hook that returns the store instance.
 *
 * @example
 *
 * import { useStore } from 'easy-peasy';
 *
 * function MyComponent() {
 *   const store = useStore();
 *   return <div>{store.getState().foo}</div>;
 * }
 */
export function useStore<
  StoreModel extends object = {},
  StoreConfig extends EasyPeasyConfig<any, any> = any
>(): Store<StoreModel, StoreConfig>;

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
 * const { useStoreActions, useStoreState, useStoreDispatch, useStore } = createTypedHooks<StoreModel>();
 *
 * useStoreActions(actions => actions.todo.add); // fully typed
 */
export function createTypedHooks<StoreModel extends Object = {}>(): {
  useStoreActions: <Result>(
    mapActions: (actions: Actions<StoreModel>) => Result,
  ) => Result;
  useStoreDispatch: () => Dispatch<StoreModel>;
  useStoreState: <Result>(
    mapState: (state: State<StoreModel>) => Result,
    equalityFn?: (prev: Result, next: Result) => boolean,
  ) => Result;
  useStore: () => Store<StoreModel>;
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
export class StoreProvider<StoreModel extends object = {}> extends Component<{
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
  useStoreRehydrated: () => boolean;
};

interface UseLocalStore<StoreModel extends object, InitialData> {
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

// #region Persist

export interface PersistStorage {
  getItem: (key: string) => any | Promise<any>;
  setItem: (key: string, data: any) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
}

export interface Transformer {
  in?: (data: any, key: string) => any;
  out?: (data: any, key: string) => any;
}

export interface PersistConfig<Model extends object> {
  blacklist?: Array<keyof Model>;
  mergeStrategy?: 'merge' | 'mergeDeep' | 'overwrite';
  storage?: 'localStorage' | 'sessionStorage' | PersistStorage;
  transformers?: Array<Transformer>;
  whitelist?: Array<keyof Model>;
}

export interface TransformConfig {
  blacklist?: Array<string>;
  whitelist?: Array<string>;
}

export function createTransform(
  inbound?: (data: any, key: string) => any,
  outbound?: (data: any, key: string) => any,
  config?: TransformConfig,
): Transformer;

export function persist<Model extends object>(
  model: Model,
  config?: PersistConfig<Model>,
): Model;

export function useStoreRehydrated(): boolean;

// #endregion
