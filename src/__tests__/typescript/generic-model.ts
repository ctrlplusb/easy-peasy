import { O } from 'ts-toolbelt';

/**
 * ARRANGE
 */

interface Person {
  name: string;
}

type StateMapper<Model extends object> = {
  [P in keyof Model]: Model[P];
};

type State<Model extends object> = StateMapper<O.Filter<Model, Action<any>>>;

type Action<Model extends object> = (state: State<Model>) => void;

/**
 * WORKING CASE - "NORMAL" MODEL INTERFACE
 */

interface NormalModel {
  data: Person[];
  fetch: Action<NormalModel>;
}

const normalModel: NormalModel = {
  data: [],
  fetch: state => {
    //      👍 works
    state.data[0].name;
  },
};

/**
 * BROKEN CASE - "GENERIC" MODEL INTERFACE
 */

interface ObjectWithId {
  id: string;
}

interface GenericModel<Item extends ObjectWithId> {
  data: Item[];
  fetch: Action<GenericModel<Item>>;
}

const createModel = <Item extends ObjectWithId>(): GenericModel<Item> => {
  return {
    data: [],
    fetch: state => {
      //     👇 broken
      state.data;
    },
  };
};
