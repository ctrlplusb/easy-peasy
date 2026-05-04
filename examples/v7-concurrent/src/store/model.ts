import {
  Action,
  Thunk,
  action,
  persist,
  thunk,
} from 'easy-peasy';

export type Todo = { id: string; text: string };

export interface CounterModel {
  count: number;
  increment: Action<CounterModel>;
}

export interface CatalogItem {
  id: number;
  name: string;
  category: string;
}

export interface CatalogModel {
  items: CatalogItem[];
  query: string;
  loadItems: Thunk<CatalogModel, number>;
  setItems: Action<CatalogModel, CatalogItem[]>;
  setQuery: Action<CatalogModel, string>;
}

export interface TodosModel {
  items: Todo[];
  addItem: Action<TodosModel, Todo>;
  addItemAsync: Thunk<TodosModel, { text: string }>;
}

export interface StoreModel {
  counter: CounterModel;
  catalog: CatalogModel;
  todos: TodosModel;
}

const counter: CounterModel = {
  count: 0,
  increment: action((state) => {
    state.count += 1;
  }),
};

const CATEGORIES = ['Fruit', 'Veg', 'Dairy', 'Bakery', 'Pantry'];

function makeItem(id: number): CatalogItem {
  return {
    id,
    name: `Item-${id.toString().padStart(4, '0')}`,
    category: CATEGORIES[id % CATEGORIES.length],
  };
}

const catalog: CatalogModel = {
  items: [],
  query: '',
  setItems: action((state, items) => {
    state.items = items;
  }),
  setQuery: action((state, query) => {
    state.query = query;
  }),
  loadItems: thunk(async (actions, count) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const items = Array.from({ length: count }, (_, i) => makeItem(i));
    actions.setItems(items);
  }),
};

const todos: TodosModel = {
  items: [],
  addItem: action((state, todo) => {
    state.items.push(todo);
  }),
  addItemAsync: thunk(async (actions, payload) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    actions.addItem({ id: crypto.randomUUID(), text: payload.text });
  }),
};

export const storeModel: StoreModel = {
  counter: persist(counter),
  catalog,
  todos,
};
