import { Component } from 'react';
import {
  AnyAction,
  compose,
  Dispatch as ReduxDispatch,
  Middleware,
  Observable,
  Reducer as ReduxReducer,
  Store as ReduxStore,
  StoreEnhancer,
} from 'redux';
import { O } from 'ts-toolbelt';

export type ReduxAction = AnyAction;

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

type InvalidObjectTypes = string | Array<any> | RegExp | Date | Function;

type IncludesDeep3<Obj extends object, M extends any> = O.Includes<
  Obj,
  M
> extends 1
  ? 1
  : O.Includes<
      {
        [P in keyof Obj]: Obj[P] extends object ? O.Includes<Obj, M> : 0;
      },
      1
    >;

type IncludesDeep2<Obj extends object, M extends any> = O.Includes<
  Obj,
  M
> extends 1
  ? 1
  : O.Includes<
      {
        [P in keyof Obj]: Obj[P] extends object ? IncludesDeep3<Obj[P], M> : 0;
      },
      1
    >;

type IncludesDeep<Obj extends object, M extends any> = O.Includes<
  Obj,
  M
> extends 1
  ? 1
  : O.Includes<
      {
        [P in keyof Obj]: Obj[P] extends object ? IncludesDeep2<Obj[P], M> : 0;
      },
      1
    >;

type StateResolver<
  Model extends object,
  StoreModel extends object,
  Result = any
> = (state: State<Model>, storeState: State<StoreModel>) => Result;

type StateResolvers<Model extends object, StoreModel extends object> =
  | []
  | [StateResolver<Model, StoreModel, any>]
  | [
      StateResolver<Model, StoreModel, any>,
      StateResolver<Model, StoreModel, any>,
    ]
  | [
      StateResolver<Model, StoreModel, any>,
      StateResolver<Model, StoreModel, any>,
      StateResolver<Model, StoreModel, any>,
    ]
  | [
      StateResolver<Model, StoreModel, any>,
      StateResolver<Model, StoreModel, any>,
      StateResolver<Model, StoreModel, any>,
      StateResolver<Model, StoreModel, any>,
    ]
  | [
      StateResolver<Model, StoreModel, any>,
      StateResolver<Model, StoreModel, any>,
      StateResolver<Model, StoreModel, any>,
      StateResolver<Model, StoreModel, any>,
      StateResolver<Model, StoreModel, any>,
    ]
  | [
      StateResolver<Model, StoreModel, any>,
      StateResolver<Model, StoreModel, any>,
      StateResolver<Model, StoreModel, any>,
      StateResolver<Model, StoreModel, any>,
      StateResolver<Model, StoreModel, any>,
      StateResolver<Model, StoreModel, any>,
    ];

type AnyFunction = (...args: any[]) => any;

type ActionEmitterTypes = Action<any, any> | Thunk<any, any, any, any, any>;

type ActionListenerTypes = ActionOn<any, any> | ThunkOn<any, any, any>;

type ActionTypes =
  | ActionEmitterTypes
  | ActionListenerTypes
  | Unstable_EffectOn<any, any, any>;

interface ActionCreator<Payload = void> {
  (payload: Payload): void;
  type: string;
  z__creator: 'actionWithPayload';
}

interface ThunkCreator<Payload = void, Result = any> {
  (payload: Payload extends undefined ? void : Payload): Result;
  type: string;
  startType: string;
  successType: string;
  failType: string;
  z__creator: 'thunkWithPayload';
}

type ActionOrThunkCreator<Payload = void, Result = void> =
  | ActionCreator<Payload>
  | ThunkCreator<Payload, Result>;

type Helpers<Model extends object, StoreModel extends object, Injections> = {
  dispatch: Dispatch<StoreModel>;
  fail: AnyFunction;
  getState: () => State<Model>;
  getStoreActions: () => Actions<StoreModel>;
  getStoreState: () => State<StoreModel>;
  injections: Injections;
  meta: Meta;
};

// #region Helpers

/**
 * This utility will pull the state within an action out of the Proxy form into
 * a natural form, allowing you to console.log or inspect it.
 *
 * @param state - The action state
 *
 * @example
 *
 * ```typescript
 * import { debug, action } from 'easy-peasy';
 *
 * const model = {
 *   todos: [],
 *   addTodo: action((state, payload) => {
 *     console.log(debug(state));
 *     state.todos.push(payload);
 *     console.log(debug(state));
 *   })
 * }
 * ```
 */
export function debug<StateDraft extends object = {}>(
  state: StateDraft,
): StateDraft;

// #endregion

// #region Listeners

type ValidListenerProperties<ActionsModel extends object> = {
  [P in keyof ActionsModel]: P extends IndexSignatureKeysOfType<ActionsModel>
    ? never
    : ActionsModel[P] extends ActionListenerTypes
    ? P
    : ActionsModel[P] extends object
    ? IncludesDeep<ActionsModel[P], ActionListenerTypes> extends 1
      ? P
      : never
    : never;
}[keyof ActionsModel];

type ListenerMapper<
  ActionsModel extends object,
  K extends keyof ActionsModel
> = {
  [P in K]: ActionsModel[P] extends ActionOn<any, any>
    ? ActionCreator<TargetPayload<any>>
    : ActionsModel[P] extends ThunkOn<any, any, any>
    ? ThunkCreator<TargetPayload<any>, any>
    : ActionsModel[P] extends object
    ? RecursiveListeners<ActionsModel[P]>
    : ActionsModel[P];
};

type RecursiveListeners<ActionsModel extends object> = ListenerMapper<
  ActionsModel,
  ValidListenerProperties<ActionsModel>
>;

/**
 * Filters a model into a type that represents the listener actions/thunks
 *
 * @example
 *
 * type OnlyListeners = Listeners<Model>;
 */
export type Listeners<Model extends object = {}> = RecursiveListeners<Model>;

// #endregion

// #region Actions

type ValidActionProperties<ActionsModel extends object> = {
  [P in keyof ActionsModel]: P extends IndexSignatureKeysOfType<ActionsModel>
    ? never
    : ActionsModel[P] extends ActionEmitterTypes
    ? P
    : ActionsModel[P] extends object
    ? IncludesDeep<ActionsModel[P], ActionEmitterTypes> extends 1
      ? P
      : never
    : never;
}[keyof ActionsModel];

type ActionMapper<ActionsModel extends object, K extends keyof ActionsModel> = {
  [P in K]: ActionsModel[P] extends Action<any, any>
    ? ActionCreator<ActionsModel[P]['payload']>
    : ActionsModel[P] extends Thunk<any, any, any, any, any>
    ? ActionsModel[P]['payload'] extends void
      ? ThunkCreator<void, ActionsModel[P]['result']>
      : ThunkCreator<ActionsModel[P]['payload'], ActionsModel[P]['result']>
    : ActionsModel[P] extends object
    ? RecursiveActions<ActionsModel[P]>
    : ActionsModel[P];
};

type RecursiveActions<ActionsModel extends object> = ActionMapper<
  ActionsModel,
  ValidActionProperties<ActionsModel>
>;

/**
 * Filters a model into a type that represents the action/thunk creators.
 *
 * @example
 *
 * ```typescript
 * import { Actions, useStoreActions } from 'easy-peasy';
 * import { StoreModel } from './my-store';
 *
 * function MyComponent() {
 *   const doSomething = useStoreActions(
 *    (actions: Actions<StoreModel>) => actions.doSomething
 *   );
 * }
 * ```
 */
export type Actions<Model extends object = {}> = RecursiveActions<Model>;

// #endregion

// #region State

type StateTypes = Computed<any, any, any> | Reducer<any, any> | ActionTypes;

type StateMapper<StateModel extends object> = {
  [P in keyof StateModel]: StateModel[P] extends Generic<infer T>
    ? T
    : P extends IndexSignatureKeysOfType<StateModel>
    ? StateModel[P]
    : StateModel[P] extends Computed<any, any, any>
    ? StateModel[P]['result']
    : StateModel[P] extends Reducer<any, any>
    ? StateModel[P]['result']
    : StateModel[P] extends object
    ? StateModel[P] extends InvalidObjectTypes
      ? StateModel[P]
      : IncludesDeep<StateModel[P], StateTypes | ActionTypes> extends 1
      ? RecursiveState<StateModel[P]>
      : StateModel[P]
    : StateModel[P];
};

type RecursiveState<Model extends object> = StateMapper<
  O.Filter<Model, ActionTypes>
>;

/**
 * Filters a model into a type that represents the state only (i.e. no actions)
 *
 * @example
 *
 * ```typescript
 * import { State, useStoreState } from 'easy-peasy';
 * import { StoreModel } from './my-store';
 *
 * function MyComponent() {
 *   const stuff = useStoreState((state: State<StoreModel>) => state.stuff);
 * }
 * ```
 */
export type State<Model extends object = {}> = RecursiveState<Model>;

// #endregion

// #region Store + Config + Creation

/**
 * Creates a store.
 *
 * https://easy-peasy.dev/docs/api/create-store.html
 *
 * @example
 *
 * ```typescript
 * import { createStore } from 'easy-peasy';
 *
 * interface StoreModel {
 *   todos: string[];
 * }
 *
 * const store = createStore<StoreModel>({
 *   todos: []
 * });
 * ```
 */
export function createStore<
  StoreModel extends object = {},
  InitialState extends undefined | object = undefined,
  Injections extends object = {}
>(
  model: StoreModel,
  config?: EasyPeasyConfig<InitialState, Injections>,
): Store<StoreModel, EasyPeasyConfig<InitialState, Injections>>;

/**
 * Configuration interface for stores.
 *
 * @example
 *
 * ```typescript
 * import { createStore } from 'easy-peasy';
 * import model from './my-model';
 *
 * const store = createStore(model, {
 *   devTools: false,
 *   name: 'MyConfiguredStore',
 * });
 * ```
 */
export interface EasyPeasyConfig<
  InitialState extends undefined | object = undefined,
  Injections extends object = {}
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
  version?: number;
  reducerEnhancer?: (reducer: ReduxReducer<any, any>) => ReduxReducer<any, any>;
}

export interface MockedAction {
  type: string;
  [key: string]: any;
}

export interface AddModelResult {
  resolveRehydration: () => Promise<void>;
}

/**
 * An Easy Peasy store. This is essentially a Redux store with additional enhanced
 * APIs attached.
 *
 * @example
 *
 * ```typescript
 * import { Store } from 'easy-peasy';
 * import { StoreModel } from './store';
 *
 * type MyEasyPeasyStore = Store<StoreModel>;
 * ```
 */
export interface Store<
  StoreModel extends object = {},
  StoreConfig extends EasyPeasyConfig<any, any> = EasyPeasyConfig<undefined, {}>
> extends ReduxStore<State<StoreModel>> {
  addModel: <ModelSlice extends object>(
    key: string,
    modelSlice: ModelSlice,
  ) => AddModelResult;
  clearMockedActions: () => void;
  dispatch: Dispatch<StoreModel>;
  getActions: () => Actions<StoreModel>;
  getListeners: () => Listeners<StoreModel>;
  getMockedActions: () => MockedAction[];
  persist: {
    clear: () => Promise<void>;
    flush: () => Promise<void>;
    resolveRehydration: () => Promise<void>;
  };
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
  StoreModel extends object = {},
  Action extends ReduxAction = AnyAction
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
 * Declares a thunk against your model type definition.
 *
 * https://easy-peasy.dev/docs/typescript-api/thunk.html
 *
 * @param Model - The model that the thunk is being bound to.
 * @param Payload - The type of the payload expected. Set to undefined if none.
 * @param Injections - The type for the injections provided to the store
 * @param StoreModel - The root model type for the store. Useful if using getStoreState helper.
 * @param Result - The type for the expected return from the thunk.
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
  Model extends object,
  Payload = undefined,
  Injections = any,
  StoreModel extends object = {},
  Result = any
> = {
  type: 'thunk';
  payload: Payload;
  result: Result;
};

/**
 * Declares an thunk against your model.
 *
 * Thunks are typically used to encapsulate side effects and are able to
 * dispatch other actions.
 *
 * https://easy-peasy.dev/docs/api/thunk.html
 *
 * @example
 *
 * ```typescript
 * import { thunk } from 'easy-peasy';
 *
 * const store = createStore({
 *   login: thunk(async (actions, payload) => {
 *      const user = await loginService(payload);
 *      actions.loginSucceeded(user);
 *   })
 * });
 * ```
 */
export function thunk<
  Model extends object = {},
  Payload = undefined,
  Injections = any,
  StoreModel extends object = {},
  Result = any
>(
  thunk: (
    actions: Actions<Model>,
    payload: Payload,
    helpers: Helpers<Model, StoreModel, Injections>,
  ) => Result,
): Thunk<Model, Payload, Injections, StoreModel, Result>;

// #endregion

// #region Listener Thunk

export interface ThunkOn<
  Model extends object,
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
    helpers: Helpers<Model, StoreModel, Injections>,
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
export type Action<Model extends object, Payload = void> = {
  type: 'action';
  payload: Payload;
  result: void | State<Model>;
};

/**
 * Declares an action.
 *
 * https://easy-peasy.dev/docs/api/action
 *
 * @example
 *
 * import { action } from 'easy-peasy';
 *
 * const store = createStore({
 *   count: 0,
 *   increment: action((state) => {
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
  Model extends object,
  Result,
  StoreModel extends object = {}
> = {
  type: 'computed';
  result: Result;
};

type DefaultComputationFunc<Model extends object, Result> = (
  state: State<Model>,
) => Result;

export function computed<
  Model extends object = {},
  Result = void,
  StoreModel extends object = {},
  Resolvers extends StateResolvers<Model, StoreModel> = StateResolvers<
    Model,
    StoreModel
  >
>(
  resolversOrCompFunc: Resolvers | DefaultComputationFunc<Model, Result>,
  compFunc?: Resolvers extends [AnyFunction]
    ? (arg0: ReturnType<Resolvers[0]>) => Result
    : Resolvers extends [AnyFunction, AnyFunction]
    ? (arg0: ReturnType<Resolvers[0]>, arg1: ReturnType<Resolvers[1]>) => Result
    : Resolvers extends [AnyFunction, AnyFunction, AnyFunction]
    ? (
        arg0: ReturnType<Resolvers[0]>,
        arg1: ReturnType<Resolvers[1]>,
        arg2: ReturnType<Resolvers[2]>,
      ) => Result
    : Resolvers extends [AnyFunction, AnyFunction, AnyFunction, AnyFunction]
    ? (
        arg0: ReturnType<Resolvers[0]>,
        arg1: ReturnType<Resolvers[1]>,
        arg2: ReturnType<Resolvers[2]>,
        arg3: ReturnType<Resolvers[3]>,
      ) => Result
    : Resolvers extends [
        AnyFunction,
        AnyFunction,
        AnyFunction,
        AnyFunction,
        AnyFunction,
      ]
    ? (
        arg0: ReturnType<Resolvers[0]>,
        arg1: ReturnType<Resolvers[1]>,
        arg2: ReturnType<Resolvers[2]>,
        arg3: ReturnType<Resolvers[3]>,
        arg4: ReturnType<Resolvers[4]>,
      ) => Result
    : Resolvers extends [
        AnyFunction,
        AnyFunction,
        AnyFunction,
        AnyFunction,
        AnyFunction,
        AnyFunction,
      ]
    ? (
        arg0: ReturnType<Resolvers[0]>,
        arg1: ReturnType<Resolvers[1]>,
        arg2: ReturnType<Resolvers[2]>,
        arg3: ReturnType<Resolvers[3]>,
        arg4: ReturnType<Resolvers[4]>,
        arg5: ReturnType<Resolvers[5]>,
      ) => Result
    : () => Result,
): Computed<Model, Result, StoreModel>;

// #endregion

// #region EffectOn

export type Unstable_EffectOn<
  Model extends object = {},
  StoreModel extends object = {},
  Injections = any
> = {
  type: 'effectOn';
};

type DependencyResolver<State> = (state: State) => any;

type Dependencies<
  Resolvers extends StateResolvers<any, any>
> = Resolvers extends [AnyFunction]
  ? [ReturnType<Resolvers[0]>]
  : Resolvers extends [AnyFunction, AnyFunction]
  ? [ReturnType<Resolvers[0]>, ReturnType<Resolvers[1]>]
  : Resolvers extends [AnyFunction, AnyFunction, AnyFunction]
  ? [
      ReturnType<Resolvers[0]>,
      ReturnType<Resolvers[1]>,
      ReturnType<Resolvers[2]>,
    ]
  : Resolvers extends [AnyFunction, AnyFunction, AnyFunction, AnyFunction]
  ? [
      ReturnType<Resolvers[0]>,
      ReturnType<Resolvers[1]>,
      ReturnType<Resolvers[2]>,
      ReturnType<Resolvers[3]>,
    ]
  : Resolvers extends [
      AnyFunction,
      AnyFunction,
      AnyFunction,
      AnyFunction,
      AnyFunction,
    ]
  ? [
      ReturnType<Resolvers[0]>,
      ReturnType<Resolvers[1]>,
      ReturnType<Resolvers[2]>,
      ReturnType<Resolvers[3]>,
      ReturnType<Resolvers[4]>,
    ]
  : Resolvers extends [
      AnyFunction,
      AnyFunction,
      AnyFunction,
      AnyFunction,
      AnyFunction,
      AnyFunction,
    ]
  ? [
      ReturnType<Resolvers[0]>,
      ReturnType<Resolvers[1]>,
      ReturnType<Resolvers[2]>,
      ReturnType<Resolvers[3]>,
      ReturnType<Resolvers[4]>,
      ReturnType<Resolvers[4]>,
    ]
  : any[];

type Change<Resolvers extends StateResolvers<any, any>> = {
  prev: Dependencies<Resolvers>;
  current: Dependencies<Resolvers>;
  action: {
    type: string;
    payload?: any;
  };
};

export type Dispose = () => any;

export function unstable_effectOn<
  Model extends object = {},
  StoreModel extends object = {},
  Injections = any,
  Resolvers extends StateResolvers<Model, StoreModel> = StateResolvers<
    Model,
    StoreModel
  >
>(
  dependencies: Resolvers,
  effect: (
    actions: Actions<Model>,
    change: Change<Resolvers>,
    helpers: Helpers<Model, StoreModel, Injections>,
  ) => undefined | Dispose,
): Unstable_EffectOn<Model, StoreModel, Injections>;

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

// #region Generics

/**
 * Used to declare generic state on a model.
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
 * Used to assign a generic state value against a model.
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
 * https://easy-peasy.dev/docs/api/use-store-state.html
 *
 * Note: you can create a pre-typed version of this hook via "createTypedHooks"
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
  StoreState extends State<any> = State<{}>,
  Result = any
>(
  mapState: (state: StoreState) => Result,
  equalityFn?: (prev: Result, next: Result) => boolean,
): Result;

/**
 * A React Hook allowing you to use actions within your component.
 *
 * https://easy-peasy.dev/docs/api/use-store-actions.html
 *
 * Note: you can create a pre-typed version of this hook via "createTypedHooks"
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
  StoreActions extends Actions<any> = Actions<{}>,
  Result = any
>(mapActions: (actions: StoreActions) => Result): Result;

/**
 * A react hook that returns the store instance.
 *
 * https://easy-peasy.dev/docs/api/use-store.html
 *
 * Note: you can create a pre-typed version of this hook via "createTypedHooks"
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
  StoreConfig extends EasyPeasyConfig<any, any> = EasyPeasyConfig<undefined, {}>
>(): Store<StoreModel, StoreConfig>;

/**
 * A React Hook allowing you to use the store's dispatch within your component.
 *
 * https://easypeasy.now.sh/docs/api/use-store-dispatch.html
 *
 * Note: you can create a pre-typed version of this hook via "createTypedHooks"
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
export function useStoreDispatch<
  StoreModel extends object = {}
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
export function createTypedHooks<StoreModel extends object = {}>(): {
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
 *   </StoreProvider>
 * );
 */
export class StoreProvider<StoreModel extends object = {}> extends Component<{
  store: Store<StoreModel>;
}> {}

// #endregion

// #region Context + Local Stores

interface StoreModelInitializer<
  StoreModel extends object,
  RuntimeModel extends undefined | object
> {
  (runtimeModel?: RuntimeModel): StoreModel;
}

export function createContextStore<
  StoreModel extends object = {},
  Injections extends object = {},
  RuntimeModel extends undefined | object = StoreModel,
  StoreConfig extends EasyPeasyConfig<any, any> = EasyPeasyConfig<
    undefined,
    Injections
  >
>(
  model: StoreModel | StoreModelInitializer<StoreModel, RuntimeModel>,
  config?: StoreConfig,
): {
  Provider: React.FC<{
    runtimeModel?: RuntimeModel;
    injections?: Injections | ((previousInjections: Injections) => Injections);
  }>;
  useStore: () => Store<StoreModel, StoreConfig>;
  useStoreState: <Result = any>(
    mapState: (state: State<StoreModel>) => Result,
    equalityFn?: (prev: Result, next: Result) => boolean,
  ) => Result;
  useStoreActions: <Result = any>(
    mapActions: (actions: Actions<StoreModel>) => Result,
  ) => Result;
  useStoreDispatch: () => Dispatch<StoreModel>;
  useStoreRehydrated: () => boolean;
};

export function useLocalStore<
  StoreModel extends object = {},
  StoreConfig extends EasyPeasyConfig<any, any> = EasyPeasyConfig<undefined, {}>
>(
  modelCreator: (prevState?: State<StoreModel>) => StoreModel,
  dependencies?: any[],
  storeConfig?: (
    prevState?: State<StoreModel>,
    prevConfig?: StoreConfig,
  ) => StoreConfig,
): [State<StoreModel>, Actions<StoreModel>, Store<StoreModel, StoreConfig>];

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
  allow?: Array<keyof Model>;
  deny?: Array<keyof Model>;
  mergeStrategy?: 'mergeDeep' | 'mergeShallow' | 'overwrite';
  storage?: 'localStorage' | 'sessionStorage' | PersistStorage;
  transformers?: Array<Transformer>;
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

export function persist<Model extends object = {}>(
  model: Model,
  config?: PersistConfig<Model>,
): Model;

export function useStoreRehydrated(): boolean;

// #endregion
