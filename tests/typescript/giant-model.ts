// This is essentially a stress test on our types to make sure we don't break TS

import {
  Action,
  Thunk,
  Computed,
  Reducer,
  Generic,
  ActionOn,
  ThunkOn,
  createStore,
  action,
  thunk,
  computed,
  actionOn,
  thunkOn,
  reducer,
} from 'easy-peasy';

interface Foo {
  name: string;
  age: number;
}

interface StoreModel {
  one: One;
  two: Two;
  three: Three;
  four: Four;
  five: Five;
  six: Six;
  seven: Seven;
  eight: Eight;
  nine: Nine;
  ten: Ten;
}

interface Deepest {
  one: string;
  two: Action<Deepest, string>;
}

interface One {
  deep: {
    deeper: {
      deepest: Deepest;
    };
  };
  tooDeep: {
    deep: {
      deeper: {
        deepest: Deepest;
      };
    };
  };
  one: OneOne;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
  eleven: string;
  twelve: Action<One, string>;
  thirteen: Thunk<One, string>;
  fourteen: Computed<One, string, StoreModel>;
  fifteen: ActionOn<One>;
  sixteen: ThunkOn<One>;
  seventeen: Reducer<{ name: string }>;
}

interface OneOne {
  one: string;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
}

interface Two {
  one: TwoOne;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
  eleven: string;
  twelve: Action<Two, string>;
  thirteen: Thunk<Two, string>;
  fourteen: Computed<Two, string, StoreModel>;
  fifteen: ActionOn<Two>;
  sixteen: ThunkOn<Two>;
  seventeen: Reducer<{ name: string }>;
}

interface TwoOne {
  one: string;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
}

interface Three {
  one: ThreeOne;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
  eleven: string;
  twelve: Action<Three, string>;
  thirteen: Thunk<Three, string>;
  fourteen: Computed<Three, string, StoreModel>;
  fifteen: ActionOn<Three>;
  sixteen: ThunkOn<Three>;
  seventeen: Reducer<{ name: string }>;
}

interface ThreeOne {
  one: string;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
}

interface Four {
  one: FourOne;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
  eleven: string;
  twelve: Action<Four, string>;
  thirteen: Thunk<Four, string>;
  fourteen: Computed<Four, string, StoreModel>;
  fifteen: ActionOn<Four>;
  sixteen: ThunkOn<Four>;
  seventeen: Reducer<{ name: string }>;
}

interface FourOne {
  one: string;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
}

interface Five {
  one: FiveOne;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
  eleven: string;
  twelve: Action<Five, string>;
  thirteen: Thunk<Five, string>;
  fourteen: Computed<Five, string, StoreModel>;
  fifteen: ActionOn<Five>;
  sixteen: ThunkOn<Five>;
  seventeen: Reducer<{ name: string }>;
}

interface FiveOne {
  one: string;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
}

interface Six {
  one: SixOne;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
  eleven: string;
  twelve: Action<Six, string>;
  thirteen: Thunk<Six, string>;
  fourteen: Computed<Six, string, StoreModel>;
  fifteen: ActionOn<Six>;
  sixteen: ThunkOn<Six>;
  seventeen: Reducer<{ name: string }>;
}

interface SixOne {
  one: string;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
}

interface Seven {
  one: SevenOne;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
  eleven: string;
  twelve: Action<Seven, string>;
  thirteen: Thunk<Seven, string>;
  fourteen: Computed<Seven, string, StoreModel>;
  fifteen: ActionOn<Seven>;
  sixteen: ThunkOn<Seven>;
  seventeen: Reducer<{ name: string }>;
}

interface SevenOne {
  one: string;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
}

interface Eight {
  one: EightOne;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
  eleven: string;
  twelve: Action<Eight, string>;
  thirteen: Thunk<Eight, string>;
  fourteen: Computed<Eight, string, StoreModel>;
  fifteen: ActionOn<Eight>;
  sixteen: ThunkOn<Eight>;
  seventeen: Reducer<{ name: string }>;
}

interface EightOne {
  one: string;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
}

interface Nine {
  one: NineOne;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
  eleven: string;
  twelve: Action<Nine, string>;
  thirteen: Thunk<Nine, string>;
  fourteen: Computed<Nine, string, StoreModel>;
  fifteen: ActionOn<Nine>;
  sixteen: ThunkOn<Nine>;
  seventeen: Reducer<{ name: string }>;
}

interface NineOne {
  one: string;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
}

interface Ten {
  one: TenOne;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
  eleven: string;
  twelve: Action<Ten, string>;
  thirteen: Thunk<Ten, string>;
  fourteen: Computed<Ten, string, StoreModel>;
  fifteen: ActionOn<Ten>;
  sixteen: ThunkOn<Ten>;
  seventeen: Reducer<{ name: string }>;
}

interface TenOne {
  one: string;
  two: boolean;
  three: { [key: string]: Foo };
  four: Map<string, number>;
  five: number;
  six: string | boolean | number;
  seven: object;
  eight?: Set<string>;
  nine: Date;
  ten: Array<number>;
}

const model: StoreModel = {
  one: {
    deep: {
      deeper: {
        deepest: {
          one: 'one',
          two: action((state, payload) => {
            state.one = payload;
          }),
        },
      },
    },
    tooDeep: {
      deep: {
        deeper: {
          deepest: {
            one: 'one',
            two: action((state, payload) => {
              state.one = payload;
            }),
          },
        },
      },
    },
    one: {
      one: 'one',
      two: true,
      three: {
        foo: {
          name: 'foo',
          age: 1,
        },
      },
      four: new Map(),
      five: 5,
      six: 'six',
      seven: { anything: 'anything' },
      eight: new Set(),
      nine: new Date(),
      ten: [1],
    },
    two: true,
    three: {
      foo: {
        name: 'foo',
        age: 1,
      },
    },
    four: new Map(),
    five: 5,
    six: 'six',
    seven: { anything: 'anything' },
    eight: new Set(),
    nine: new Date(),
    ten: [1],
    eleven: '11',
    twelve: action((state, payload) => {
      state.six = payload;
    }),
    thirteen: thunk((actions, payload) => {
      actions.twelve(payload);
    }),
    fourteen: computed(
      [(state) => state.one.one, (state, globalState) => globalState.one.one],
      (one, two) => {
        return one + two;
      },
    ),
    fifteen: actionOn(
      (actions) => actions.thirteen,
      (state, target) => {
        state.six = target.payload;
      },
    ),
    sixteen: thunkOn(
      (actions) => actions.thirteen,
      (actions, target) => {
        actions.thirteen(target.payload);
      },
    ),
    seventeen: reducer((state = { name: 'foo' }) => state),
  },
  two: {
    one: {
      one: 'one',
      two: true,
      three: {
        foo: {
          name: 'foo',
          age: 1,
        },
      },
      four: new Map(),
      five: 5,
      six: 'six',
      seven: { anything: 'anything' },
      eight: new Set(),
      nine: new Date(),
      ten: [1],
    },
    two: true,
    three: {
      foo: {
        name: 'foo',
        age: 1,
      },
    },
    four: new Map(),
    five: 5,
    six: 'six',
    seven: { anything: 'anything' },
    eight: new Set(),
    nine: new Date(),
    ten: [1],
    eleven: '11',
    twelve: action((state, payload) => {
      state.six = payload;
    }),
    thirteen: thunk((actions, payload) => {
      actions.twelve(payload);
    }),
    fourteen: computed(
      [(state) => state.one.one, (state, globalState) => globalState.one.one],
      (one, two) => {
        return one + two;
      },
    ),
    fifteen: actionOn(
      (actions) => actions.thirteen,
      (state, target) => {
        state.six = target.payload;
      },
    ),
    sixteen: thunkOn(
      (actions) => actions.thirteen,
      (actions, target) => {
        actions.thirteen(target.payload);
      },
    ),
    seventeen: reducer((state = { name: 'foo' }) => state),
  },
  three: {
    one: {
      one: 'one',
      two: true,
      three: {
        foo: {
          name: 'foo',
          age: 1,
        },
      },
      four: new Map(),
      five: 5,
      six: 'six',
      seven: { anything: 'anything' },
      eight: new Set(),
      nine: new Date(),
      ten: [1],
    },
    two: true,
    three: {
      foo: {
        name: 'foo',
        age: 1,
      },
    },
    four: new Map(),
    five: 5,
    six: 'six',
    seven: { anything: 'anything' },
    eight: new Set(),
    nine: new Date(),
    ten: [1],
    eleven: '11',
    twelve: action((state, payload) => {
      state.six = payload;
    }),
    thirteen: thunk((actions, payload) => {
      actions.twelve(payload);
    }),
    fourteen: computed(
      [(state) => state.one.one, (state, globalState) => globalState.one.one],
      (one, two) => {
        return one + two;
      },
    ),
    fifteen: actionOn(
      (actions) => actions.thirteen,
      (state, target) => {
        state.six = target.payload;
      },
    ),
    sixteen: thunkOn(
      (actions) => actions.thirteen,
      (actions, target) => {
        actions.thirteen(target.payload);
      },
    ),
    seventeen: reducer((state = { name: 'foo' }) => state),
  },
  four: {
    one: {
      one: 'one',
      two: true,
      three: {
        foo: {
          name: 'foo',
          age: 1,
        },
      },
      four: new Map(),
      five: 5,
      six: 'six',
      seven: { anything: 'anything' },
      eight: new Set(),
      nine: new Date(),
      ten: [1],
    },
    two: true,
    three: {
      foo: {
        name: 'foo',
        age: 1,
      },
    },
    four: new Map(),
    five: 5,
    six: 'six',
    seven: { anything: 'anything' },
    eight: new Set(),
    nine: new Date(),
    ten: [1],
    eleven: '11',
    twelve: action((state, payload) => {
      state.six = payload;
    }),
    thirteen: thunk((actions, payload) => {
      actions.twelve(payload);
    }),
    fourteen: computed(
      [(state) => state.one.one, (state, globalState) => globalState.one.one],
      (one, two) => {
        return one + two;
      },
    ),
    fifteen: actionOn(
      (actions) => actions.thirteen,
      (state, target) => {
        state.six = target.payload;
      },
    ),
    sixteen: thunkOn(
      (actions) => actions.thirteen,
      (actions, target) => {
        actions.thirteen(target.payload);
      },
    ),
    seventeen: reducer((state = { name: 'foo' }) => state),
  },
  five: {
    one: {
      one: 'one',
      two: true,
      three: {
        foo: {
          name: 'foo',
          age: 1,
        },
      },
      four: new Map(),
      five: 5,
      six: 'six',
      seven: { anything: 'anything' },
      eight: new Set(),
      nine: new Date(),
      ten: [1],
    },
    two: true,
    three: {
      foo: {
        name: 'foo',
        age: 1,
      },
    },
    four: new Map(),
    five: 5,
    six: 'six',
    seven: { anything: 'anything' },
    eight: new Set(),
    nine: new Date(),
    ten: [1],
    eleven: '11',
    twelve: action((state, payload) => {
      state.six = payload;
    }),
    thirteen: thunk((actions, payload) => {
      actions.twelve(payload);
    }),
    fourteen: computed(
      [(state) => state.one.one, (state, globalState) => globalState.one.one],
      (one, two) => {
        return one + two;
      },
    ),
    fifteen: actionOn(
      (actions) => actions.thirteen,
      (state, target) => {
        state.six = target.payload;
      },
    ),
    sixteen: thunkOn(
      (actions) => actions.thirteen,
      (actions, target) => {
        actions.thirteen(target.payload);
      },
    ),
    seventeen: reducer((state = { name: 'foo' }) => state),
  },
  six: {
    one: {
      one: 'one',
      two: true,
      three: {
        foo: {
          name: 'foo',
          age: 1,
        },
      },
      four: new Map(),
      five: 5,
      six: 'six',
      seven: { anything: 'anything' },
      eight: new Set(),
      nine: new Date(),
      ten: [1],
    },
    two: true,
    three: {
      foo: {
        name: 'foo',
        age: 1,
      },
    },
    four: new Map(),
    five: 5,
    six: 'six',
    seven: { anything: 'anything' },
    eight: new Set(),
    nine: new Date(),
    ten: [1],
    eleven: '11',
    twelve: action((state, payload) => {
      state.six = payload;
    }),
    thirteen: thunk((actions, payload) => {
      actions.twelve(payload);
    }),
    fourteen: computed(
      [(state) => state.one.one, (state, globalState) => globalState.one.one],
      (one, two) => {
        return one + two;
      },
    ),
    fifteen: actionOn(
      (actions) => actions.thirteen,
      (state, target) => {
        state.six = target.payload;
      },
    ),
    sixteen: thunkOn(
      (actions) => actions.thirteen,
      (actions, target) => {
        actions.thirteen(target.payload);
      },
    ),
    seventeen: reducer((state = { name: 'foo' }) => state),
  },
  seven: {
    one: {
      one: 'one',
      two: true,
      three: {
        foo: {
          name: 'foo',
          age: 1,
        },
      },
      four: new Map(),
      five: 5,
      six: 'six',
      seven: { anything: 'anything' },
      eight: new Set(),
      nine: new Date(),
      ten: [1],
    },
    two: true,
    three: {
      foo: {
        name: 'foo',
        age: 1,
      },
    },
    four: new Map(),
    five: 5,
    six: 'six',
    seven: { anything: 'anything' },
    eight: new Set(),
    nine: new Date(),
    ten: [1],
    eleven: '11',
    twelve: action((state, payload) => {
      state.six = payload;
    }),
    thirteen: thunk((actions, payload) => {
      actions.twelve(payload);
    }),
    fourteen: computed(
      [(state) => state.one.one, (state, globalState) => globalState.one.one],
      (one, two) => {
        return one + two;
      },
    ),
    fifteen: actionOn(
      (actions) => actions.thirteen,
      (state, target) => {
        state.six = target.payload;
      },
    ),
    sixteen: thunkOn(
      (actions) => actions.thirteen,
      (actions, target) => {
        actions.thirteen(target.payload);
      },
    ),
    seventeen: reducer((state = { name: 'foo' }) => state),
  },
  eight: {
    one: {
      one: 'one',
      two: true,
      three: {
        foo: {
          name: 'foo',
          age: 1,
        },
      },
      four: new Map(),
      five: 5,
      six: 'six',
      seven: { anything: 'anything' },
      eight: new Set(),
      nine: new Date(),
      ten: [1],
    },
    two: true,
    three: {
      foo: {
        name: 'foo',
        age: 1,
      },
    },
    four: new Map(),
    five: 5,
    six: 'six',
    seven: { anything: 'anything' },
    eight: new Set(),
    nine: new Date(),
    ten: [1],
    eleven: '11',
    twelve: action((state, payload) => {
      state.six = payload;
    }),
    thirteen: thunk((actions, payload) => {
      actions.twelve(payload);
    }),
    fourteen: computed(
      [(state) => state.one.one, (state, globalState) => globalState.one.one],
      (one, two) => {
        return one + two;
      },
    ),
    fifteen: actionOn(
      (actions) => actions.thirteen,
      (state, target) => {
        state.six = target.payload;
      },
    ),
    sixteen: thunkOn(
      (actions) => actions.thirteen,
      (actions, target) => {
        actions.thirteen(target.payload);
      },
    ),
    seventeen: reducer((state = { name: 'foo' }) => state),
  },
  nine: {
    one: {
      one: 'one',
      two: true,
      three: {
        foo: {
          name: 'foo',
          age: 1,
        },
      },
      four: new Map(),
      five: 5,
      six: 'six',
      seven: { anything: 'anything' },
      eight: new Set(),
      nine: new Date(),
      ten: [1],
    },
    two: true,
    three: {
      foo: {
        name: 'foo',
        age: 1,
      },
    },
    four: new Map(),
    five: 5,
    six: 'six',
    seven: { anything: 'anything' },
    eight: new Set(),
    nine: new Date(),
    ten: [1],
    eleven: '11',
    twelve: action((state, payload) => {
      state.six = payload;
    }),
    thirteen: thunk((actions, payload) => {
      actions.twelve(payload);
    }),
    fourteen: computed(
      [(state) => state.one.one, (state, globalState) => globalState.one.one],
      (one, two) => {
        return one + two;
      },
    ),
    fifteen: actionOn(
      (actions) => actions.thirteen,
      (state, target) => {
        state.six = target.payload;
      },
    ),
    sixteen: thunkOn(
      (actions) => actions.thirteen,
      (actions, target) => {
        actions.thirteen(target.payload);
      },
    ),
    seventeen: reducer((state = { name: 'foo' }) => state),
  },
  ten: {
    one: {
      one: 'one',
      two: true,
      three: {
        foo: {
          name: 'foo',
          age: 1,
        },
      },
      four: new Map(),
      five: 5,
      six: 'six',
      seven: { anything: 'anything' },
      eight: new Set(),
      nine: new Date(),
      ten: [1],
    },
    two: true,
    three: {
      foo: {
        name: 'foo',
        age: 1,
      },
    },
    four: new Map(),
    five: 5,
    six: 'six',
    seven: { anything: 'anything' },
    eight: new Set(),
    nine: new Date(),
    ten: [1],
    eleven: '11',
    twelve: action((state, payload) => {
      state.six = payload;
    }),
    thirteen: thunk((actions, payload) => {
      actions.twelve(payload);
    }),
    fourteen: computed(
      [(state) => state.one.one, (state, globalState) => globalState.one.one],
      (one, two) => {
        return one + two;
      },
    ),
    fifteen: actionOn(
      (actions) => actions.thirteen,
      (state, target) => {
        state.six = target.payload;
      },
    ),
    sixteen: thunkOn(
      (actions) => actions.thirteen,
      (actions, target) => {
        actions.thirteen(target.payload);
      },
    ),
    seventeen: reducer((state = { name: 'foo' }) => state),
  },
};

const store = createStore(model);

store.getState().one.deep.deeper.deepest.one;
// @ts-expect-error
store.getState().one.deep.deeper.deepest.two;
// ❗️ This has hit our maximum depth level for mapping out state, therefore
//    the action still exists on the type where you would expect it not to
store.getState().one.tooDeep.deep.deeper.deepest.two;
store.getState().one.one.seven;
store.getState().four.seven;
store.getState().ten.one.ten[0];
store.getActions().one.thirteen('foo');
store.getActions().ten.thirteen('foo');
