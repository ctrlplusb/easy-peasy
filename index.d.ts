import * as React from 'react';
import * as Redux from 'redux';
import { Param1, Overwrite, Omit } from 'type-zoo';

/**
 * Helper types
 */

// conditional types from https://www.typescriptlang.org/docs/handbook/advanced-types.html#example-1
type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];
type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;
type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

// helpers to extract actions and values from easy-peasy models
type IsMoreThanOneParam<Func> = Func extends (a: any, b: undefined) => any
  ? {}
  : Func extends (a: undefined) => any
  ? {}
  : Func;
type FunctionWithoutFirstParam<F> = IsMoreThanOneParam<F> extends Function
  ? (payload: Param1<F>) => void
  : () => void;
type FunctionsWithoutFirstParam<T> = { [k in keyof T]: FunctionWithoutFirstParam<T[k]> };
type ActionPrimitive = number | string | boolean | null | symbol;
type ActionFunction<ActionPayload = any> = ActionPayload extends undefined | void
  ? () => void
  : ActionPayload extends ActionPrimitive | Array<ActionPrimitive>
  ? (payload: ActionPayload) => void
  : ActionPayload;

// given a model, get the state shapes of any reducer(...)s
type FunctionReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
type ReducerStateShapes<Model> = {
  [K in keyof FunctionProperties<Model>]: FunctionReturnType<FunctionProperties<Model>[K]>
};

// given a model, get the value types of any select(...)s
type SelectPropertyNames<T> = { [K in keyof T]: T[K] extends Select<any, any> ? K : never }[keyof T];
type SelectProperties<T> = Pick<T, SelectPropertyNames<T>>;
type SelectPropertyTypes<T> = {
  [K in keyof SelectProperties<T>]: SelectProperties<T>[K] extends Select<any, infer R> ? R : never
};
type SelectValueTypes<Model> = { [K in keyof Model]: SelectPropertyTypes<Model[K]> };

// given a model, get the value types of any reducer(...)s and select(...)s
type ReducerValues<Model> = ReducerStateShapes<Model> & SelectValueTypes<Model>;

// given an easy-peasy Model, extract just the actions
export type ModelActions<Model> = {
  [k in keyof Model]: Omit<FunctionsWithoutFirstParam<FunctionProperties<Model[k]>>, keyof ReducerValues<Model>[k]>
};

// given an easy-peasy Model, extract just the state values, minus reducers and select(...)s
export type MutableModelValues<Model> = {
  [k in keyof Model]: Omit<NonFunctionProperties<Model[k]>, keyof ReducerValues<Model>[k]>
};

// given an easy-peasy Model, extract just the state values
export type ModelValues<Model> = MutableModelValues<Model> & ReducerValues<Model>;

// easy-peasy's decorated Redux dispatch() (e.g. dispatch.todos.insert(item); )
export type Dispatch<Model = any> = Redux.Dispatch & ModelActions<Model>;

/**
 * https://github.com/ctrlplusb/easy-peasy#createstoremodel-config
 *
 * Example usage:
 *
 * interface Model {
 *   todos: {
 *     items: Array<string>;
 *     addTodo: Action<{ items: Array<string> }, string>;
 *   },
 *   session: {
 *     user: User;
 *   }
 * }
 *
 * const store = createStore<Model>({
 *   todos: {
 *     items: [],
 *     addTodo: (state, text) => {
 *       state.items.push(text)
 *     }
 *   },
 *   session: {
 *     user: undefined,
 *   }
 * })
 */

type EnhancerFunction = (...funcs: Array<Redux.StoreEnhancer>) => Redux.StoreEnhancer;

export interface Config<Model> {
  devTools?: boolean;
  initialState?: MutableModelValues<Model>;
  injections?: any;
  middleware?: Array<Redux.Middleware>;
  compose?: typeof Redux.compose | Redux.StoreEnhancer | EnhancerFunction;
  reducerEnhancer?: (reducer: Redux.Reducer) => Redux.Reducer;
}

export type Store<Model = any> = Overwrite<
  Redux.Store,
  { dispatch: Dispatch<Model>; getState: () => Readonly<ModelValues<Model>> }
>;

export function createStore<Model = any>(model: Model, config?: Config<Model>): Store<Model>;

/**
 * https://github.com/ctrlplusb/easy-peasy#action
 *
 * Example usage:
 *
 * const add: Action<TodoValues, string> = (state => payload) => {
 *   state.items.push(payload)
 * }
 */

export type Action<StateValues, Payload = undefined> = Payload extends undefined
  ? (state: StateValues) => void | StateValues
  : (state: StateValues, payload: Payload) => void | StateValues;

/**
 * https://github.com/ctrlplusb/easy-peasy#effectaction
 *
 * Example usage:
 *
 * const login: Effect<Model, Credentials> = effect(async (dispatch, payload) => {
 *   const user = await loginService(payload)
 *   dispatch.session.loginSucceeded(user)
 * })
 *
 * or
 *
 * const login = effect<Model, Credentials>(async (dispatch, payload) => {
 *   const user = await loginService(payload)
 *   dispatch.session.loginSucceeded(user)
 * })
 */

export type Effect<Model, Payload = undefined, EffectResult = any> = Payload extends undefined
  ? (
      effectAction: (
        dispatch: Dispatch<Model>,
        payload: undefined,
        getState: () => Readonly<ModelValues<Model>>,
      ) => EffectResult,
      b?: undefined,
    ) => EffectResult
  : (
      effectAction: (
        dispatch: Dispatch<Model>,
        payload: Payload,
        getState: () => Readonly<ModelValues<Model>>,
      ) => EffectResult,
      b: Payload,
    ) => EffectResult;

export function effect<Model = any, Payload = never, EffectResult = any>(
  effectAction: (dispatch: Dispatch<Model>, payload: Payload, getState: () => Readonly<ModelValues<Model>>) => EffectResult,
): Effect<Model, Payload, EffectResult>;

/**
 * https://github.com/ctrlplusb/easy-peasy#reducerfn
 *
 * Example usage:
 *
 * const counter: Reducer<number> = reducer((state = 1, action) => {
 *   switch (action.type) {
 *     case 'INCREMENT': state + 1;
 *     default: return state;
 *   }
 * }
 *
 * or
 *
 * const counter = reducer<number>((state = 1, action) => {
 *   switch (action.type) {
 *     case 'INCREMENT': state + 1;
 *     default: return state;
 *   }
 * }
 */

export type Reducer<State> = (state: State, action: Redux.Action) => State;

export function reducer<State>(reducerFunction: Reducer<State>): Reducer<State>;

/**
 * https://github.com/ctrlplusb/easy-peasy#selectselector
 *
 * Example usage:
 *
 * const totalPrice: Select<ShoppingBasket, number> = select(state =>
 *   state.products.reduce((acc, cur) => acc + cur.price, 0)
 * )
 *
 * or
 *
 * const totalPrice = select<ShoppingBasket, number>(state =>
 *   state.products.reduce((acc, cur) => acc + cur.price, 0)
 * )
 */

export type Select<StateValues, ResultantType> = (
  selectFunction: (state: StateValues) => ResultantType,
  dependencies?: Array<(state: any) => any>,
) => never;

export function select<StateValues = any, ResultantType = any>(
  selectFunction: (state: StateValues) => ResultantType,
  dependencies?: Array<(state: any) => any>,
): Select<StateValues, ResultantType>;

/**
 * https://github.com/ctrlplusb/easy-peasy#storeprovider
 */

export class StoreProvider<Model = any> extends React.Component<{ store: Store<Model> }> {}

/**
 * https://github.com/ctrlplusb/easy-peasy#usestoremapstate-externals
 *
 * Example usage:
 *
 * const todos = useStore<Model, Array<string>>(state => state.todos.items);
 *
 * const { totalPrice, netPrice } = useStore<Model, { totalPrice: number; netPrice: number; }>(state => ({
 *   totalPrice: state.basket.totalPrice,
 *   netPrice: state.basket.netPrice
 * }));
 */

export function useStore<Model = any, StateValue = any>(
  mapState: (state: ModelValues<Model>) => StateValue,
  externals?: Array<any>,
): StateValue;

/**
 * https://github.com/ctrlplusb/easy-peasy#useactionmapaction
 *
 * Example usage:
 *
 * const addTodo = useAction<Model, string>(dispatch => dispatch.todos.add);
 *
 * const { saveTodo, removeTodo } = useAction<Model, {
 *   saveTodo: (todo: string) => void;
 *   removeTodo: (todo: string) => void;
 * }>(dispatch => ({
 *   saveTodo: dispatch.todos.save,
 *   removeTodo: dispatch.todo.toggle
 * }));
 */

export function useAction<Model = any, ActionPayload = any>(
  mapAction: (dispatch: Dispatch<Model>) => ActionFunction<ActionPayload>,
): ActionFunction<ActionPayload>;
