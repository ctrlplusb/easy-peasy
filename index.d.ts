/// <reference types="symbol-observable" />

import { Component } from 'react';
import {
  compose,
  AnyAction,
  Dispatch as ReduxDispatch,
  Reducer as ReduxReducer,
  Store as ReduxStore,
  StoreEnhancer,
  Middleware,
  Observable,
} from 'redux';
import { O } from 'ts-toolbelt';

type ActionTypes =
  | Action<any, any>
  | Thunk<any, any, any, any, any>
  | ActionOn<any, any>
  | ThunkOn<any, any, any>;

interface ActionCreator<Payload = void> {
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

// #region Utils

export function debug<StateDraft extends object = {}>(
  state: StateDraft,
): StateDraft;

export function memo<Fn extends Function = any>(fn: Fn, cacheSize: number): Fn;

// #endregion

// #region Models

export interface ModelConfiguration<ModelDef extends object = {}> {
  persist?: PersistConfig<ModelDef>;
}

export type Model<Def extends object> = {
  [P in keyof Def]: Def[P];
} & {
  ezpz__model: ModelConfiguration<Def>;
};

export function model<ModelType extends Model<any>>(
  definition: Omit<ModelType, 'ezpz__model'>,
  configuration?: ModelConfiguration<Omit<ModelType, 'ezpz__model'>>,
): ModelType;

// #endregion Models

// #region Listeners

type ListenerMapper<ActionsModel extends object> = {
  [P in keyof ActionsModel]: ActionsModel[P] extends ActionOn<any, any>
    ? ActionCreator<TargetPayload<any>>
    : ActionsModel[P] extends ThunkOn<any, any, any>
    ? ThunkCreator<TargetPayload<any>, any>
    : ActionsModel[P] extends Model<any>
    ? RecursiveListeners<ActionsModel[P]>
    : ActionsModel[P];
};

type RecursiveListeners<ModelDefinition extends Model<any>> = ListenerMapper<
  O.Select<
    ModelDefinition,
    Model<any> | ActionOn<any, any> | ThunkOn<any, any, any>
  >
>;

/**
 * Filters a model into a type that represents the listeners.
 *
 * @example
 *
 * import { Listeners } from 'easy-peasy';
 * import { StoreModel } from './store';
 *
 * type OnlyListeners = Listeners<StoreModel>;
 */
export type Listeners<ModelDefinition extends Model<any>> = RecursiveListeners<
  ModelDefinition
>;

// #endregion

// #region Actions

type ActionMapper<ActionsModel extends object> = {
  [P in keyof ActionsModel]: ActionsModel[P] extends Action<any, any>
    ? ActionCreator<ActionsModel[P]['payload']>
    : ActionsModel[P] extends Thunk<any, any, any, any, any>
    ? ThunkCreator<ActionsModel[P]['payload'], ActionsModel[P]['result']> // ? ActionsModel[P]['payload'] extends void //   ? ThunkCreator<void, ActionsModel[P]['result']> //   : ThunkCreator<ActionsModel[P]['payload'], ActionsModel[P]['result']>
    : ActionsModel[P] extends Model<any>
    ? RecursiveActions<ActionsModel[P]>
    : ActionsModel[P];
};

type RecursiveActions<ModelDefinition extends Model<any>> = ActionMapper<
  O.Select<
    ModelDefinition,
    Model<any> | Action<any, any> | Thunk<any, any, any, any, any>
  >
>;

/**
 * Filters a model into a type that represents the action/thunk creators
 *
 * @example
 *
 * import { Actions } from 'easy-peasy';
 * import { StoreModel } from './store';
 *
 * type OnlyActions = Actions<StoreModel>;
 */
export type Actions<ModelDefinition extends Model<any>> = RecursiveActions<
  ModelDefinition
>;

// #endregion

// #region State

type StateMapper<StateModel extends object> = {
  [P in keyof StateModel]: StateModel[P] extends Generic<infer T>
    ? T
    : StateModel[P] extends Computed<any, any, any>
    ? StateModel[P]['result']
    : StateModel[P] extends Reducer<any, any>
    ? StateModel[P]['result']
    : StateModel[P] extends Model<any>
    ? RecursiveState<StateModel[P]>
    : StateModel[P];
};

type RecursiveState<ModelDefinition extends Model<any>> = StateMapper<
  O.Filter<O.Omit<ModelDefinition, 'ezpz__model'>, ActionTypes>
>;

/**
 * Filters a model into a type that represents the state only (i.e. no actions, etc).
 *
 * @example
 *
 * import { State } from 'easy-peasy';
 * import { StoreModel } from './store';
 *
 * type StateOnly = State<StoreModel>;
 */
export type State<ModelDef extends Model<any>> = RecursiveState<ModelDef>;

// #endregion

// #region Store + Config + Creation

/**
 * Creates an easy-peasy powered Redux store.
 *
 * https://github.com/ctrlplusb/easy-peasy#createstoremodel-config
 *
 * @example
 *
 * import { createStore, Model } from 'easy-peasy';
 *
 * type StoreModel = Model<{
 *   todos: Array<string>;
 * }>;
 *
 * const store = createStore<StoreModel>({
 *   todos: [],
 * });
 */
export function createStore<
  StoreModel extends Model<any> = Model<{}>,
  InitialState extends undefined | object = undefined,
  Injections = any
>(
  model: StoreModel,
  config?: EasyPeasyConfig<InitialState, Injections>,
): Store<StoreModel, EasyPeasyConfig<InitialState, Injections>>;

/**
 * Store configuration
 */
export interface EasyPeasyConfig<
  InitialState extends undefined | object = undefined,
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
 * import { Store } from 'easy-peasy';
 * import { StoreModel } from './store';
 *
 * type EnhancedReduxStore = Store<StoreModel>;
 */
export interface Store<
  StoreModel extends Model<any> = Model<{}>,
  StoreConfig extends EasyPeasyConfig<any, any> = EasyPeasyConfig<
    undefined,
    any
  >
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
 * import { Dispatch } from 'easy-peasy';
 * import { StoreModel } from './store';
 *
 * type DispatchWithActions = Dispatch<StoreModel>;
 */
export type Dispatch<
  StoreModel extends Model<any> = Model<{}>,
  Action extends ReduxAction = AnyAction
> = Actions<StoreModel> & ReduxDispatch<Action>;

// #endregion

// #region Types shared by ActionOn and ThunkOn

type Target = ActionOrThunkCreator<any> | string;

type TargetResolver<
  ModelDefinition extends Model<any>,
  StoreModel extends Model<any>
> = (
  actions: Actions<ModelDefinition>,
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
 * import { Thunk, Model } from 'easy-peasy';
 *
 * type TodosModel = Model<{
 *   todos: Array<string>;
 *   addTodo: Thunk<TodosModel, string>;
 * }>
 */
export type Thunk<
  ModelDefinition extends Model<any> = Model<{}>,
  Payload = void,
  Injections = any,
  StoreModel extends Model<any> = Model<{}>,
  Result = any
> = {
  type: 'thunk';
  payload: Payload;
  result: Result;
};

/**
 * Declares an thunk action type against your model.
 *
 * https://easy-peasy.now.sh/docs/api/thunk.html
 *
 * @example
 *
 * import { thunk, model } from 'easy-peasy';
 * import { SessionModel } from './session.types';
 *
 * const sessionModel = model<SessionModel>({
 *   login: thunk(async (actions, payload) => {
 *    await loginService(payload);
 *  })
 * });
 */
export function thunk<
  ModelDefinition extends Model<any> = Model<{}>,
  Payload = void,
  Injections = any,
  StoreModel extends Model<any> = Model<{}>,
  Result = any
>(
  thunk: (
    actions: Actions<ModelDefinition>,
    payload: Payload,
    helpers: {
      dispatch: Dispatch<StoreModel>;
      getState: () => State<ModelDefinition>;
      getStoreActions: () => Actions<StoreModel>;
      getStoreState: () => State<StoreModel>;
      injections: Injections;
      meta: Meta;
    },
  ) => Result,
): Thunk<ModelDefinition, Payload, Injections, StoreModel, Result>;

// #endregion

// #region Listener Thunk

export interface ThunkOn<
  ModelDefinition extends Model<any> = Model<{}>,
  Injections = any,
  StoreModel extends Model<any> = Model<{}>
> {
  type: 'thunkOn';
}

export function thunkOn<
  ModelDefinition extends Model<any> = Model<{}>,
  Injections = any,
  StoreModel extends Model<any> = Model<{}>,
  Resolver extends TargetResolver<ModelDefinition, StoreModel> = TargetResolver<
    ModelDefinition,
    StoreModel
  >
>(
  targetResolver: Resolver,
  handler: (
    actions: Actions<ModelDefinition>,
    target: TargetPayload<PayloadFromResolver<Resolver>>,
    helpers: {
      dispatch: Dispatch<StoreModel>;
      getState: () => State<ModelDefinition>;
      getStoreActions: () => Actions<StoreModel>;
      getStoreState: () => State<StoreModel>;
      injections: Injections;
      meta: Meta;
    },
  ) => any,
): ThunkOn<ModelDefinition, Injections, StoreModel>;

// #endregion

// #region Action

/**
 * Represents an action.
 *
 * @example
 *
 * import { Action, Model } from 'easy-peasy';
 *
 * type TodosModel = Model<{
 *   todos: Array<Todo>;
 *   addTodo: Action<TodosModel, Todo>;
 * }>
 */
export interface Action<ModelDef extends Model<any>, Payload = void> {
  (state: State<ModelDef>, payload: Payload): void | State<ModelDef>;
  type: 'action';
  payload: Payload;
  result: void | State<ModelDef>;
}

/**
 * Declares an action.
 *
 * https://easy-peasy.now.sh/docs/api/action
 *
 * @example
 *
 * import { action, model } from 'easy-peasy';
 * import { CounterModel } from './counter.types';
 *
 * const counterModel = model<CounterModel>({
 *   count: 0,
 *   increment: action((state)) => {
 *    state.count += 1;
 *   })
 * });
 */
export function action<ModelDef extends Model<any>, Payload = any>(
  fn: (state: State<ModelDef>, payload: Payload) => void | State<ModelDef>,
): Action<ModelDef, Payload>;

// #endregion

// #region Listener Action

export interface ActionOn<
  ModelDefinition extends Model<any>,
  StoreModel extends object = {}
> {
  type: 'actionOn';
  result: void | State<ModelDefinition>;
}

export function actionOn<
  ModelDefinition extends Model<any> = Model<{}>,
  StoreModel extends Model<any> = Model<{}>,
  Resolver extends TargetResolver<ModelDefinition, StoreModel> = TargetResolver<
    ModelDefinition,
    StoreModel
  >
>(
  targetResolver: Resolver,
  handler: (
    state: State<ModelDefinition>,
    target: TargetPayload<PayloadFromResolver<Resolver>>,
  ) => void | State<ModelDefinition>,
): ActionOn<ModelDefinition, StoreModel>;

// #endregion

// #region Computed

/**
 * Represents a computed property.
 *
 * @example
 *
 * import { Computed, Model } from 'easy-peasy';
 *
 * type ProductsModel = Model<{
 *   products: Array<Product>;
 *   totalPrice: Computed<ProductsModel, number>;
 * }>;
 */
export type Computed<
  ModelDefinition extends Model<any>,
  Result,
  StoreModel extends Model<any> = Model<any>
> = {
  type: 'computed';
  result: Result;
};

type Resolver<
  ModelDefinition extends Model<any>,
  StoreModel extends Model<any>
> = (state: State<ModelDefinition>, storeState: State<StoreModel>) => any;

type DefaultComputationFunc<ModelDefinition extends Model<any>, Result> = (
  state: State<ModelDefinition>,
) => Result;

export function computed<
  ModelDefinition extends Model<any> = Model<{}>,
  Result = void,
  StoreModel extends Model<any> = Model<{}>,
  Resolvers extends Resolver<ModelDefinition, StoreModel>[] = Resolver<
    ModelDefinition,
    StoreModel
  >[]
>(
  resolversOrCompFunc:
    | (Resolvers | [])
    | DefaultComputationFunc<ModelDefinition, Result>,
  compFunc?: (
    ...args: {
      [K in keyof Resolvers]: Resolvers[K] extends (...args: any[]) => any
        ? ReturnType<Resolvers[K]>
        : string;
    }
  ) => Result,
): Computed<ModelDefinition, Result, StoreModel>;

// #endregion

// #region Reducer

/**
 * A reducer type.
 *
 * Useful when declaring your model.
 *
 * @example
 *
 * import { Reducer, Model } from 'easy-peasy';
 *
 * type StoreModel = Model<{
 *   router: Reducer<ReactRouterState>;
 * }>
 */
export type Reducer<State = any, Action extends ReduxAction = AnyAction> = {
  type: 'reducer';
  result: State;
};

/**
 * Allows you to declare a custom reducer to manage a bit of your state.
 *
 * https://easy-peasy.now.sh/docs/api/reducer.html
 *
 * @example
 *
 * import { reducer, model } from 'easy-peasy';
 * import { StoreModel } from './store';
 *
 * const storeModel = model<StoreModel>({
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

// #region Generics

/**
 * Used to declare generic properties on a model.
 *
 * @example
 *
 * interface MyGenericModel<T> {
 *   value: Generic<T>;
 *   setValue: Action<MyGenericModel<T>, T>;
 * }
 *
 * const numberModel: MyGenericModel<number> = {
 *   value: generic(1337),
 *   setValue: action((state, value) => {
 *     state.value = value;
 *   })
 * };
 */
export class Generic<T> {
  type: 'ezpz__generic';
}

/**
 * Used to declare generic properties on a model.
 *
 * @example
 *
 * interface MyGenericModel<T> {
 *   value: Generic<T>;
 *   setValue: Action<MyGenericModel<T>, T>;
 * }
 *
 * const numberModel: MyGenericModel<number> = {
 *   value: generic(1337),
 *   setValue: action((state, value) => {
 *     state.value = value;
 *   })
 * };
 */
export function generic<T>(value: T): Generic<T>;

// #endregion Generics

// #region Hooks

/**
 * A React Hook allowing you to use state within your component.
 *
 * https://easy-peasy.now.sh/docs/api/use-store-state.html
 *
 * @example
 *
 * import { useStoreState, State } from 'easy-peasy';
 * import { StoreModel } from './store';
 *
 * function MyComponent() {
 *   const todos = useStoreState((state: State<StoreModel>) => state.todos.items);
 *   return todos.map(todo => <Todo todo={todo} />);
 * }
 */
export function useStoreState<
  StoreState extends State<Model<any>> = State<Model<{}>>,
  Result = any
>(
  mapState: (state: StoreState) => Result,
  equalityFn?: (prev: Result, next: Result) => boolean,
): Result;

/**
 * A React Hook allowing you to use actions within your component.
 *
 * https://easy-peasy.now.sh/docs/api/use-store-actions.html
 *
 * @example
 *
 * import { useStoreActions, Actions } from 'easy-peasy';
 * import { StoreModel } from 'easy-peasy';
 *
 * function MyComponent() {
 *   const addTodo = useStoreActions((actions: Actions<StoreModel>) => actions.todos.add);
 *   return <AddTodoForm save={addTodo} />;
 * }
 */
export function useStoreActions<
  StoreActions extends Actions<Model<any>> = Actions<Model<{}>>,
  Result = any
>(mapActions: (actions: StoreActions) => Result): Result;

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
  StoreModel extends Model<any> = Model<{}>,
  StoreConfig extends EasyPeasyConfig<any, any> = EasyPeasyConfig<
    undefined,
    any
  >
>(): Store<StoreModel, StoreConfig>;

/**
 * A React Hook allowing you to use the store's dispatch within your component.
 *
 * https://easypeasy.now.sh/docs/api/use-store-dispatch.html
 *
 * @example
 *
 * import { useStoreDispatch } from 'easy-peasy';
 * import { StoreModel } from './store';
 *
 * function MyComponent() {
 *   const dispatch = useStoreDispatch<StoreModel>();
 *   return <AddTodoForm save={(todo) => dispatch({ type: 'ADD_TODO', payload: todo })} />;
 * }
 */
export function useStoreDispatch<
  StoreModel extends Model<any> = Model<{}>
>(): Dispatch<StoreModel>;

/**
 * A utility function used to create pre-typed hooks.
 *
 * https://easypeasy.now.sh/docs/api/create-typed-hooks.html
 *
 * @example
 * import { StoreModel } from './store';
 *
 * const { useStoreActions, useStoreState, useStoreDispatch, useStore } = createTypedHooks<StoreModel>();
 *
 * useStoreActions(actions => actions.todo.add); // fully typed
 */
export function createTypedHooks<StoreModel extends Model<any> = Model<{}>>(): {
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
 * https://easypeasy.now.sh/docs/api/store-provider.html
 *
 * @example
 *
 * import { StoreProvider } from 'easy-peasy';
 * import store from './store';
 *
 * ReactDOM.render(
 *   <StoreProvider store={store}>
 *     <App />
 *   </StoreProvider>,
 *   document.getElementById('app')
 * );
 */
export class StoreProvider<
  StoreModel extends Model<any> = Model<{}>
> extends Component<{
  store: Store<StoreModel>;
}> {}

// #endregion

// #region Context + Local Stores

interface StoreModelInitializer<
  StoreModel extends Model<any>,
  InitialData extends undefined | object
> {
  (initialData?: InitialData): StoreModel;
}

export function createContextStore<
  StoreModel extends Model<any> = Model<{}>,
  InitialData extends undefined | object = undefined,
  StoreConfig extends EasyPeasyConfig<any, any> = EasyPeasyConfig<{}, any>
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

interface UseLocalStore<
  StoreModel extends Model<any>,
  InitialData extends undefined | object
> {
  (initialData?: InitialData): [State<StoreModel>, Actions<StoreModel>];
}

export function createComponentStore<
  StoreModel extends Model<any> = Model<{}>,
  InitialData extends undefined | object = undefined,
  StoreConfig extends EasyPeasyConfig<any, any> = EasyPeasyConfig<{}, any>
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

export interface PersistConfig<ModelDefinition extends object = {}> {
  blacklist?: Array<keyof ModelDefinition>; // TODO: Strip ezpz__model key
  mergeStrategy?: 'merge' | 'mergeDeep' | 'overwrite';
  storage?: 'localStorage' | 'sessionStorage' | PersistStorage;
  transformers?: Array<Transformer>;
  whitelist?: Array<keyof ModelDefinition>; // TODO: Strip ezpz__model key
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

export function useStoreRehydrated(): boolean;

// #endregion

export type ReduxAction = AnyAction;
