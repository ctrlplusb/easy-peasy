/* eslint-disable */

interface Pojo2 {
  [key: string]:
    | bigint
    | boolean
    | null
    | number
    | string
    | symbol
    | undefined
    | Map<any, any>
    | Set<any>
    | Array<any>
    | Function
    | object;
}

type Pojo = {
  [key: string]: any;
};

class Person {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

function createStore(v: Pojo): Pojo {
  return v;
}

const bob: Person = new Person('bob');

type Foo = {
  bar: string | boolean;
};

const foo: Foo = { bar: 'bar' };

createStore(bob);
// typings:expect-error
createStore(false);
// typings:expect-error
createStore(true);
createStore(foo);
createStore([]);
createStore({});
createStore({
  a: 'string',
  b: true,
  c: false,
  d: null,
  e: undefined,
  f: Symbol('plop'),
  g: new Map<string, string>(),
  h: new Set<string>(),
  i: [],
  j: () => {},
});
