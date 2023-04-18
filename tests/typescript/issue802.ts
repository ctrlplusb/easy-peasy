import { EffectOn, effectOn, Action, action } from 'easy-peasy';

type AppEffectOn<TModel extends object> = EffectOn<
  TModel,
  StoreModel,
  Injections
>;

interface Injections {
  doSomething: () => Promise<void>;
}

interface TodosModel {
  items: { id: number; text: string }[];
  foo: string;
  setFoo: Action<TodosModel, string>;
  onStateChanged: AppEffectOn<TodosModel>;
}

interface HelloModel {
  name: string;
  sayHelloTo: Action<HelloModel, string>;
  onStateChanged: AppEffectOn<HelloModel>;
}

interface StoreModel {
  hello: HelloModel;
  todos: TodosModel;
  rootData: number;
}

const model: StoreModel = {
  rootData: 42,
  hello: {
    name: 'Arthur',
    sayHelloTo: action((state, payload) => {
      state.name = payload;
    }),
    onStateChanged: effectOn([(state) => state.name], (_, __, helpers) => {
      console.log(`Hello, ${helpers.getState().name}`);
    }),
  },
  todos: {
    items: [],
    foo: 'bar',
    setFoo: action((state, payload) => {
      state.foo = payload;
    }),
    onStateChanged: effectOn(
      [
        (state) => state.items,
        (state) => state.foo,
        (state, storeState) => storeState.rootData,
      ],
      (actions, change, helpers) => {
        actions.setFoo('bar');

        const [prevItems, prevFoo, prevRootData] = change.prev;
        prevItems[0].text;
        const baz = `${prevFoo}bar`;
        prevRootData + 2;

        const [currentItems, currentFoo, currentRootData] = change.current;
        const qux = `${currentFoo}bar`;
        currentItems[0].text;
        currentRootData + 2;

        helpers.injections.doSomething().then(() => {});
        helpers.dispatch.todos.setFoo('plop');
        helpers.getState().items[0].id + 2;
        helpers.getStoreActions().todos.setFoo('plop');
        helpers.getStoreState().rootData + 2;
        helpers.meta.parent[0].toLowerCase();
        helpers.meta.path[0].toLowerCase();

        return () => console.log('dispose');
      },
    ),
  },
};
