import * as React from 'react';
import * as Redux from 'redux';
import { Param1, Overwrite, Omit } from 'type-zoo';

/**
 * Helper types
 */

// conditional types from https://www.typescriptlang.org/docs/handbook/advanced-types.html#example-1
type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];
type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;
type ObjectPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : T[K] extends Array<any> ? never : T[K] extends object ? K : never
}[keyof T];
type ObjectProperties<T> = Pick<T, ObjectPropertyNames<T>>;
type NonObjectPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : T[K] extends Array<any> ? K : T[K] extends object ? never : K
}[keyof T];
type NonObjectProperties<T> = Pick<T, NonObjectPropertyNames<T>>;

// helpers to extract actions and values from easy-peasy models
type IsMoreThanOneParam<Func> = Func extends (a: any, b: undefined) => any
  ? {}
  : Func extends (a: undefined) => any
  ? {}
  : Func;
type FunctionWithoutFirstParam<F> = IsMoreThanOneParam<F> extends Function
  ? (payload: Param1<F>) => void
  : () => void;

type EffectResult<Result> = Result extends Promise<any> ? Result : Promise<Result>;

// given a model slice, get the state shapes of any reducer(...)s
type FunctionReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
type ReducerPropertyNames<ModelSlice> = {
  [K in keyof ModelSlice]: ModelSlice[K] extends (state: infer S, action: Redux.Action<any>) => infer S ? K : never
}[keyof ModelSlice];
type ReducerProperties<ModelSlice> = Pick<ModelSlice, ReducerPropertyNames<ModelSlice>>;
type ReducerStateShapes<ModelSlice> = {
  [K in keyof ReducerProperties<ModelSlice>]: FunctionReturnType<ReducerProperties<ModelSlice>[K]>
};

// all non-select(...) non-reducer(....) functions in a model slice
type NonReducerFunctionProperties<ModelSlice> = Pick<
  ModelSlice,
  Exclude<
    Exclude<FunctionPropertyNames<ModelSlice>, ReducerPropertyNames<ModelSlice>>,
    SelectPropertyNames<ModelSlice>
  >
>;

// given a model slice, get the value types of any select(...)s
type SelectPropertyNames<ModelSlice> = {
  [K in keyof ModelSlice]: ModelSlice[K] extends Select<any, any> ? K : never
}[keyof ModelSlice];
type SelectProperties<ModelSlice> = Pick<ModelSlice, SelectPropertyNames<ModelSlice>>;
type SelectPropertyTypes<ModelSlice> = {
  [K in keyof SelectProperties<ModelSlice>]: SelectProperties<ModelSlice>[K] extends Select<any, infer R> ? R : never
};
type SelectValueTypes<Model> = { [K in keyof Model]: SelectPropertyTypes<Model[K]> };

// extract (for  4 levels) all non-function properties from a Model
type L0Values<Model> = NonObjectProperties<Model>;
type L1Values<Model> = { [k in keyof ObjectProperties<Model>]: NonObjectProperties<ObjectProperties<Model>[k]> };
type L2Values<Model> = {
  [k in keyof ObjectProperties<Model>]: {
    [l in keyof ObjectProperties<ObjectProperties<Model>[k]>]: NonObjectProperties<
      ObjectProperties<ObjectProperties<Model>[k]>[l]
    >
  }
};
type L3Values<Model> = {
  [k in keyof ObjectProperties<Model>]: {
    [l in keyof ObjectProperties<ObjectProperties<Model>[k]>]: {
      [m in keyof ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>]: NonObjectProperties<
        ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>[m]
      >
    }
  }
};
type L4Values<Model> = {
  [k in keyof ObjectProperties<Model>]: {
    [l in keyof ObjectProperties<ObjectProperties<Model>[k]>]: {
      [m in keyof ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>]: {
        [n in keyof ObjectProperties<
          ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>[m]
        >]: NonObjectProperties<
          ObjectProperties<ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>[m]>[n]
        >
      }
    }
  }
};

type FunctionsWithoutFirst<Model> = {
  [k in keyof NonReducerFunctionProperties<Model>]: FunctionWithoutFirstParam<NonReducerFunctionProperties<Model>[k]>
};

// extract (for  4 levels) all non-reducer(), non-select() function properties from a Model, removing the first parameter
type L0Actions<Model> = FunctionsWithoutFirst<NonReducerFunctionProperties<Model>>;
type L1Actions<Model> = { [k in keyof ObjectProperties<Model>]: FunctionsWithoutFirst<ObjectProperties<Model>[k]> };
type L2Actions<Model> = {
  [k in keyof ObjectProperties<Model>]: {
    [l in keyof ObjectProperties<ObjectProperties<Model>[k]>]: FunctionsWithoutFirst<
      ObjectProperties<ObjectProperties<Model>[k]>[l]
    >
  }
};
type L3Actions<Model> = {
  [k in keyof ObjectProperties<Model>]: {
    [l in keyof ObjectProperties<ObjectProperties<Model>[k]>]: {
      [m in keyof ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>]: FunctionsWithoutFirst<
        ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>[m]
      >
    }
  }
};
type L4Actions<Model> = {
  [k in keyof ObjectProperties<Model>]: {
    [l in keyof ObjectProperties<ObjectProperties<Model>[k]>]: {
      [m in keyof ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>]: {
        [n in keyof ObjectProperties<
          ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>[m]
        >]: FunctionsWithoutFirst<
          ObjectProperties<ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>[m]>[n]
        >
      }
    }
  }
};

// extract (for  4 levels) all select() result types from a Model
type L0SelectValues<Model> = SelectPropertyTypes<Model>;
type L1SelectValues<Model> = {
  [k in keyof ObjectProperties<Model>]: SelectPropertyTypes<ObjectProperties<Model>[k]>
};
type L2SelectValues<Model> = {
  [k in keyof ObjectProperties<Model>]: {
    [l in keyof ObjectProperties<ObjectProperties<Model>[k]>]: SelectPropertyTypes<
      ObjectProperties<ObjectProperties<Model>[k]>[l]
    >
  }
};
type L3SelectValues<Model> = {
  [k in keyof ObjectProperties<Model>]: {
    [l in keyof ObjectProperties<ObjectProperties<Model>[k]>]: {
      [m in keyof ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>]: SelectPropertyTypes<
        ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>[m]
      >
    }
  }
};
type L4SelectValues<Model> = {
  [k in keyof ObjectProperties<Model>]: {
    [l in keyof ObjectProperties<ObjectProperties<Model>[k]>]: {
      [m in keyof ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>]: {
        [n in keyof ObjectProperties<
          ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>[m]
        >]: SelectPropertyTypes<
          ObjectProperties<ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>[m]>[n]
        >
      }
    }
  }
};

// extract (for  4 levels) all reducer() state shapes from a Model
type L0ReducerShapes<Model> = ReducerStateShapes<Model>;
type L1ReducerShapes<Model> = {
  [k in keyof ObjectProperties<Model>]: ReducerStateShapes<ObjectProperties<Model>[k]>
};
type L2ReducerShapes<Model> = {
  [k in keyof ObjectProperties<Model>]: {
    [l in keyof ObjectProperties<ObjectProperties<Model>[k]>]: ReducerStateShapes<
      ObjectProperties<ObjectProperties<Model>[k]>[l]
    >
  }
};
type L3ReducerShapes<Model> = {
  [k in keyof ObjectProperties<Model>]: {
    [l in keyof ObjectProperties<ObjectProperties<Model>[k]>]: {
      [m in keyof ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>]: ReducerStateShapes<
        ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>[m]
      >
    }
  }
};
type L4ReducerShapes<Model> = {
  [k in keyof ObjectProperties<Model>]: {
    [l in keyof ObjectProperties<ObjectProperties<Model>[k]>]: {
      [m in keyof ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>]: {
        [n in keyof ObjectProperties<
          ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>[m]
        >]: ReducerStateShapes<
          ObjectProperties<ObjectProperties<ObjectProperties<ObjectProperties<Model>[k]>[l]>[m]>[n]
        >
      }
    }
  }
};

type SelectValues<Model> = L0SelectValues<Model> &
  L1SelectValues<Model> &
  L2SelectValues<Model> &
  L3SelectValues<Model> &
  L4SelectValues<Model>;
type ReducerShapes<Model> = L0ReducerShapes<Model> &
  L1ReducerShapes<Model> &
  L2ReducerShapes<Model> &
  L3ReducerShapes<Model> &
  L4ReducerShapes<Model>;
type ReduxDispatch<A extends Redux.Action> = (action: Redux.Action<A>) => Redux.Action<A>;

// given an easy-peasy Model, extract just the actions
export type ModelActions<Model> = L0Actions<Model> &
  L1Actions<Model> &
  L2Actions<Model> &
  L3Actions<Model> &
  L4Actions<Model>;

// given an easy-peasy Model, extract just the state values, minus reducers and select(...)s
export type MutableModelValues<Model> = L0Values<Model> &
  L1Values<Model> &
  L2Values<Model> &
  L3Values<Model> &
  L4Values<Model>;

// given an easy-peasy Model, extract just the state values
export type ModelValues<Model> = MutableModelValues<Model> & SelectValues<Model> & ReducerShapes<Model>;

// easy-peasy's decorated Redux dispatch() (e.g. dispatch.todos.insert(item); )
export type Dispatch<Model, A extends Redux.Action = Redux.Action<any>> = ModelActions<Model> & Redux.Dispatch<A>;

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

type EffectAction<Model, Payload, Result> = (
  dispatch: Dispatch<Model>,
  payload: Payload,
  getState: () => Readonly<ModelValues<Model>>,
  injections: any,
  meta: {
    parent: Array<string>;
    path: Array<string>;
  },
) => EffectResult<Result>;

export type Effect<Model, Payload = undefined, Result = any> = Payload extends undefined
  ? (effectAction: EffectAction<Model, Payload, Result>, b?: undefined) => EffectResult<Result>
  : (effectAction: EffectAction<Model, Payload, Result>, b: Payload) => EffectResult<Result>;

export function effect<Model = any, Payload = never, EffectResult = any>(
  effectAction: EffectAction<Model, Payload, EffectResult>,
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

export type Reducer<State> = (state: State, action: Redux.Action<any>) => State;

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
 * const todos = useStore((state: ModelValues<Model>) => state.todos.items);
 *
 * const { totalPrice, netPrice } = useStore((state: ModelValues<Model>) => ({
 *   totalPrice: state.basket.totalPrice,
 *   netPrice: state.basket.netPrice
 * }));
 */

export function useStore<Model = any, StateValue = any>(
  mapState: <State extends ModelValues<Model>>(state: State) => StateValue,
  externals?: Array<any>,
): StateValue;

/**
 * https://github.com/ctrlplusb/easy-peasy#useactionmapaction
 *
 * Example usage:
 *
 * const addTodo = useAction((dispatch: Dispatch<Model>) => dispatch.todos.add);
 *
 * const { saveTodo, removeTodo } = useAction((dispatch: Dispatch<Model>) => ({
 *   saveTodo: dispatch.todos.save,
 *   removeTodo: dispatch.todo.toggle
 * }));
 */

export function useAction<Model = any, ActionPayload = any>(
  mapAction: (dispatch: Dispatch<Model>) => ActionPayload,
): ActionPayload;
