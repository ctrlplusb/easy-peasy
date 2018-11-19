import * as React from 'react';
import * as Redux from 'redux';
import { Param1, Overwrite, Omit } from 'type-zoo';

// conditional types from https://www.typescriptlang.org/docs/handbook/advanced-types.html#example-1
type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];
type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;
type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

// helpers to extract actions and values from easy-peasy models
type IsMoreThanOneParam<Func> = Func extends (a: any, b: undefined, ...args: Array<any>) => any ? Func : never;
type FunctionWithoutFirstParam<F> = IsMoreThanOneParam<F> extends () => void
  ? (payload: Param1<F>) => void
  : () => void;
type FunctionsWithoutFirstParam<T> = { [k in keyof T]: FunctionWithoutFirstParam<T[k]> };

// given a model, get the state shapes of any reducer(...)s
type FunctionReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
type ReducerStateShapes<Model> = {
  [K in keyof FunctionProperties<Model>]: FunctionReturnType<FunctionProperties<Model>[K]>
};

// given a model, get the value types of any select(...)s
type SelectPropertyNames<T> = { [K in keyof T]: T[K] extends { __select__: infer R } ? K : never }[keyof T];
type SelectProperties<T> = Pick<T, SelectPropertyNames<T>>;
type SelectPropertyTypes<T> = {
  [K in keyof SelectProperties<T>]: SelectProperties<T>[K] extends { __select__: infer R } ? R : never
};
type SelectValueTypes<Model> = { [K in keyof Model]: SelectPropertyTypes<Model[K]> };

// given a model, get the value types of any reducer(...)s and select(...)s
type ReducerValues<Model> = ReducerStateShapes<Model> & SelectValueTypes<Model>;

// for compose in Config
type EnhancerFunction = (...funcs: Array<Redux.StoreEnhancer>) => Redux.StoreEnhancer;

// given an easy-peasy Model, extract just the actions
export type ModelActions<Model> = {
  [k in keyof Model]: Omit<FunctionsWithoutFirstParam<FunctionProperties<Model[k]>>, keyof ReducerValues<Model>[k]>
};

// given an easy-peasy Model, extract just the state values, minus reducers and select(...)s
export type ModelValuesWithoutReducers<Model> = {
  [k in keyof Model]: Omit<NonFunctionProperties<Model[k]>, keyof ReducerValues<Model>[k]>
};

// given an easy-peasy Model, extract just the state values
export type ModelValues<Model> = ModelValuesWithoutReducers<Model> & ReducerValues<Model>;

export interface Config<Model> {
  devTools?: boolean;
  initialState?: ModelValuesWithoutReducers<Model>;
  injections?: any;
  middleware?: Array<Redux.Middleware>;
  compose?: typeof Redux.compose | Redux.StoreEnhancer | EnhancerFunction;
}

// easy-peasy's decorated Redux dispatch() (e.g. dispatch.todos.insert(item); )
export type Dispatch<Model = any> = Redux.Dispatch & ModelActions<Model>;

export type Store<Model = any> = Overwrite<
  Redux.Store,
  { dispatch: Dispatch<Model>; getState: () => ReadOnly<ModelValues<Model>> }
>;

export function createStore<Model = any>(model: Model, config: Config<Model>): Store<Model>;

export type Effect<Payload = undefined> = Payload extends undefined ? (a: any) => void : (a: any, b: Payload) => void;

export function effect<Model = any, Payload = never>(
  effectAction: (dispatch: Dispatch<Model>, payload: Payload, getState: () => ReadOnly<ModelValues<Model>>) => void,
): Effect<Payload>;

export type Reducer<State> = (state: State, action: Redux.Action) => State;

export function reducer<State>(reducerFunction: Reducer<State>): Reducer<State>;

export type Select<T> = {
  __select__: T; // this type exists purely for SelectPropertyNames/SelectPropertyTypes to be able to pull out the type of T
};

export function select<State = any, T = any>(
  selectFunction: (state: State) => T,
  dependencies?: Array<(state: any) => any>,
): Select<T>;

export class StoreProvider<Model = any> extends React.Component<{ store: Store<Model> }> {}

export function useStore<StoreValue = any, Model = any>(
  mapState: (state: ModelValues<Model>) => StoreValue,
  externals?: Array<any>,
): StoreValue;

export function useAction<ActionFunction extends Function = () => void, Model = any>(
  mapAction: (dispatch: ModelActions<Model>) => ActionFunction,
): ActionFunction;
