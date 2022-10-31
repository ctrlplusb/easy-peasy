import {
  action,
  Action,
  computed,
  Computed,
  unstable_effectOn,
  Unstable_EffectOn,
} from 'easy-peasy';

type OneThroughFifteen = {
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
  six: number;
  seven: number;
  eight: number;
  nine: number;
  ten: number;
  eleven: number;
  twelve: number;
  thirteen: number;
  fourteen: number;
  fifteen: number;
};

type SixteenThroughThirty = {
  sixteen: number;
  seventeen: number;
  eighteen: number;
  nineteen: number;
  twenty: number;
  twentyOne: number;
  twentyTwo: number;
  twentyThree: number;
  twentyFour: number;
  twentyFive: number;
  twentySix: number;
  twentySeven: number;
  twentyEight: number;
  twentyNine: number;
  thirty: number;
};

type ActionPayload<T extends string> = {
  key: T;
  payload: number;
};

type NestedModel = SixteenThroughThirty & {
  setState: Action<NestedModel, ActionPayload<keyof SixteenThroughThirty>>;
  addAllTheThings: Computed<NestedModel, number, StoreModel>;
  onStateChange: Unstable_EffectOn<NestedModel, StoreModel>;
};

type StoreModel = OneThroughFifteen & {
  setState: Action<StoreModel, ActionPayload<keyof OneThroughFifteen>>;
  addAllTheThings: Computed<StoreModel, number>;
  onStateChange: Unstable_EffectOn<StoreModel>;
  nestedModel: NestedModel;
};

const storeModel: StoreModel = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  setState: action((state, { key, payload }) => {
    state[key] = payload;
  }),
  addAllTheThings: computed(
    [
      (state) => state.one,
      (state) => state.two,
      (state) => state.three,
      (state) => state.four,
      (state) => state.five,
      (state) => state.six,
      (state) => state.seven,
      (state) => state.eight,
      (state) => state.nine,
      (state) => state.ten,
      (state) => state.eleven,
      (state) => state.twelve,
      (state) => state.thirteen,
      (state) => state.fourteen,
      (state) => state.fifteen,
    ],
    (a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) => {
      return a + b + c + d + e + f + g + h + i + j + k + l + m + n + o;
    },
  ),
  onStateChange: unstable_effectOn(
    [
      (state) => state.one,
      (state) => state.two,
      (state) => state.three,
      (state) => state.four,
      (state) => state.five,
      (state) => state.six,
      (state) => state.seven,
      (state) => state.eight,
      (state) => state.nine,
      (state) => state.ten,
      (state) => state.eleven,
      (state) => state.twelve,
      (state) => state.thirteen,
      (state) => state.fourteen,
      (state) => state.fifteen,
    ],
    (_, change) => {
      const [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o] = change.current;
      const [p, q, r, s, t, u, v, w, x, y, z, aa, bb, cc, dd] = change.prev;
      // do something
    },
  ),
  nestedModel: {
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
    twentyOne: 21,
    twentyTwo: 22,
    twentyThree: 23,
    twentyFour: 24,
    twentyFive: 25,
    twentySix: 26,
    twentySeven: 27,
    twentyEight: 28,
    twentyNine: 29,
    thirty: 30,
    setState: action((state, { key, payload }) => {
      state[key] = payload;
    }),
    addAllTheThings: computed(
      [
        (state) => state.sixteen,
        (state) => state.seventeen,
        (state) => state.eighteen,
        (state) => state.nineteen,
        (state) => state.twenty,
        (state) => state.twentyOne,
        (state) => state.twentyTwo,
        (state) => state.twentyThree,
        (state) => state.twentyFour,
        (state) => state.twentyFive,
        (state) => state.twentySix,
        (state) => state.twentySeven,
        (state) => state.twentyEight,
        (state) => state.twentyNine + state.thirty,
        (_, storeState) => storeState.addAllTheThings,
      ],
      (a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) => {
        return a + b + c + d + e + f + g + h + i + j + k + l + m + n + o;
      },
    ),
    onStateChange: unstable_effectOn(
      [
        (state) => state.sixteen,
        (state) => state.seventeen,
        (state) => state.eighteen,
        (state) => state.nineteen,
        (state) => state.twenty,
        (state) => state.twentyOne,
        (state) => state.twentyTwo,
        (state) => state.twentyThree,
        (state) => state.twentyFour,
        (state) => state.twentyFive,
        (state) => state.twentySix,
        (state) => state.twentySeven,
        (state) => state.twentyEight,
        (state) => state.twentyNine,
        (_, storeState) => storeState.addAllTheThings,
      ],
      (_, change) => {
        const [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o] = change.current;
        const [p, q, r, s, t, u, v, w, x, y, z, aa, bb, cc, dd] = change.prev;
        // do something
      },
    ),
  },
};
