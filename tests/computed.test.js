/* eslint-disable react/prop-types */

import React from 'react';
import { act } from 'react-dom/test-utils';
import { produce } from 'immer';
import { render } from '@testing-library/react';
import {
  createStore,
  computed,
  action,
  useStoreState,
  StoreProvider,
} from '../src';

test('issue#633', () => {
  // ARRANGE
  const createModel = (type) => ({
    items: Array(100)
      .fill({})
      .map((_, index) => ({
        id: `${type}-${index}`,
        type,
        done: index % 2 === 0,
      })),

    completedItems: computed((state) =>
      state.items.filter((i) => i.done === true),
    ),

    setItems: action((state, payload) => {
      state.items = payload;
    }),

    removeCompletedItems: action((state) => {
      const completedIds = state.completedItems.map((i) => i.id);

      state.items = state.items.filter(
        (item) => !completedIds.includes(item.id),
      );
    }),
  });

  const store = createStore({
    abc: createModel('abc'),
    def: createModel('def'),
    allCompletedItems: computed(
      [(_, storeState) => storeState.abc, (_, storeState) => storeState.def],
      (abcItems, defItems) => [
        ...abcItems.completedItems,
        ...defItems.completedItems,
      ],
    ),
  });

  // ASSERT
  expect(store.getState().abc.completedItems.length).toBe(50);
  expect(store.getState().allCompletedItems.length).toBe(100);

  // ACT
  store.getActions().abc.removeCompletedItems();
  store.getActions().def.removeCompletedItems();

  // ASSERT
  expect(store.getState().abc.items.length).toBe(50);
  expect(store.getState().abc.completedItems.length).toBe(0);
  expect(store.getState().def.items.length).toBe(50);
  expect(store.getState().allCompletedItems.length).toBe(0);
});

test('accessing computed properties within an action', () => {
  const store = createStore({
    firstName: 'Mary',
    lastName: 'Poppins',
    fullName: computed((state) => `${state.firstName} ${state.lastName}`),
    fruits: ['apple', 'pear', 'banana'],
    fruitCount: computed((state) => state.fruits.length),
    mutltipleFruitCount: computed((state) => state.fruitCount * 2),
    details: computed((state) => ({
      fullName: `${state.firstName} ${state.lastName}`,
    })),
    flag: computed((state) => state.firstName === 'Mary'),
    report: action((state) => {
      expect(state.flag).toBe(true);
      expect(state.flag).toBe(true);
      state.result = `${state.fullName} ${state.fruitCount} ${
        state.mutltipleFruitCount
      } ${JSON.stringify(state.details)} ${state.flag}`;
    }),
  });

  store.getActions().report();

  expect(store.getState().result).toEqual(
    'Mary Poppins 3 6 {"fullName":"Mary Poppins"} true',
  );
});

test('computed properties should not execute until they are accessed', () => {
  let computedCount = 0;
  let fruitComputedCount = 0;

  const store = createStore({
    person: {
      firstName: 'Mary',
      lastName: 'Poppins',
      fullName: computed(
        [(state) => state.firstName, (state) => state.lastName],
        (firstName, lastName) => {
          computedCount += 1;
          return `${firstName} ${lastName}`;
        },
      ),
      setLastName: action((state, payload) => {
        state.lastName = payload;
      }),
    },
    fruits: {
      items: [],
      itemCount: computed((state) => {
        fruitComputedCount += 1;
        return state.items.length;
      }),
    },
  });

  store.getActions().person.setLastName('Poppins01');
  store.getActions().person.setLastName('Poppins02');
  store.getActions().person.setLastName('Poppins03');
  store.getActions().person.setLastName('Poppins04');
  store.getActions().person.setLastName('Poppins05');
  store.getActions().person.setLastName('Poppins06');

  // ASSERT
  expect(fruitComputedCount).toBe(0);

  // we expect at least one "initialisation" call
  expect(computedCount).toBe(1);

  expect(store.getState().person.fullName).toBe('Mary Poppins06');
  expect(computedCount).toBe(2);
  expect(store.getState().person.fullName).toBe('Mary Poppins06');
  expect(computedCount).toBe(2);

  // ACT
  store.getActions().person.setLastName('Poppins07');

  // ASSERT
  expect(computedCount).toBe(2);
  expect(store.getState().person.fullName).toBe('Mary Poppins07');
  expect(computedCount).toBe(3);
});

test('patched immer works as expected', () => {
  const original = {
    firstName: 'Bob',
    lastName: 'Fruits',
  };

  let getterCallCount = 0;

  // ACT
  Object.defineProperty(original, 'fullName', {
    enumerable: true,
    get: () => {
      getterCallCount += 1;
      return `${original.firstName} ${original.lastName}`;
    },
  });

  // ASSERT
  expect(original.fullName).toBe('Bob Fruits');
  expect(getterCallCount).toBe(1);

  // ACT
  const immerNoUpdate = produce(original, (draft) => draft);

  // ASSERT
  expect(immerNoUpdate).toBe(original);
  expect(getterCallCount).toBe(2);

  const newState = {
    ...original,
    firstName: 'Mary',
  };

  // ASSERT
  expect(newState.fullName).toBe('Bob Fruits');
  expect(getterCallCount).toBe(3);

  // ACT
  const immerWithUpdate = produce(original, (draft) => {
    draft.firstName = 'Mary';
  });

  // ASSERT
  expect(immerWithUpdate).not.toBe(original);
  expect(immerWithUpdate.firstName).toBe('Mary');
  expect(immerWithUpdate.fullName).toBe('Bob Fruits');
  expect(getterCallCount).toBe(4);
});

test('defining and accessing a computed property', () => {
  // ARRANGE
  const store = createStore({
    firstName: 'Mary',
    lastName: 'Poppins',
    fullName: computed(
      [(state) => state.firstName, (state) => state.lastName],
      (firstName, lastName) => `${firstName} ${lastName}`,
    ),
  });

  // ACT
  expect(store.getState().fullName).toBe('Mary Poppins');
});

test('computed properties ARE IMMEDIATELY available in an action', () => {
  // ARRANGE
  const store = createStore({
    firstName: 'Mary',
    lastName: 'Poppins',
    fullName: computed((state) => `${state.firstName} ${state.lastName}`),
    anAction: action((state) => {
      // ASSERT
      expect(state.fullName).toBe('Mary Poppins');
    }),
  });

  // ACT
  store.getActions().anAction();
});

test('can spread computed', () => {
  // ARRANGE
  const store = createStore({
    firstName: 'Mary',
    lastName: 'Poppins',
    fullName: computed((state) => `${state.firstName} ${state.lastName}`),
  });

  // ACT
  const myState = { ...store.getState() };

  // ASSERT
  expect(myState.fullName).toBe('Mary Poppins');
});

test('computed properties are memoized', () => {
  // ARRANGE
  let computedCount = 0;

  const store = createStore({
    firstName: 'Mary',
    lastName: 'Poppins',
    fullName: computed(
      [(state) => state.firstName, (state) => state.lastName],
      (firstName, lastName) => {
        computedCount += 1;
        return `${firstName} ${lastName}`;
      },
    ),
    setFirstName: action((state, payload) => {
      state.firstName = payload;
    }),
  });

  // ASSERT
  expect(computedCount).toBe(0);

  // ACT
  // eslint-disable-next-line no-unused-expressions
  store.getState().fullName;

  // ASSERT
  expect(computedCount).toBe(1);

  // ACT
  // eslint-disable-next-line no-unused-expressions
  store.getState().fullName;

  // ASSERT
  expect(computedCount).toBe(1);

  // ACT
  store.getActions().setFirstName('Bob');

  // ASSERT
  expect(store.getState().fullName).toBe('Bob Poppins');
  expect(computedCount).toBe(2);

  // ACT
  store.getActions().setFirstName('Bob');

  // ASSERT
  expect(store.getState().fullName).toBe('Bob Poppins');
  expect(computedCount).toBe(2);
});

test('state resolvers are optional', () => {
  // ARRANGE
  const store = createStore({
    firstName: 'Mary',
    lastName: 'Poppins',
    fullName: computed((state) => `${state.firstName} ${state.lastName}`),
  });

  // ASSERT
  expect(store.getState().fullName).toBe('Mary Poppins');
});

test('computed properties can access global state', () => {
  // ARRANGE
  const store = createStore({
    products: {
      items: [{ id: 1, name: 'boots', price: 20 }],
      itemMap: computed([(state) => state.items], (items) =>
        items.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {}),
      ),
      setProductName: action((state, payload) => {
        const product = state.items.find((p) => p.id === payload.id);
        product.name = payload.name;
      }),
    },
    basket: {
      productIds: [1],
      products: computed(
        [
          (state, storeState) => storeState.products.itemMap,
          (state) => state.productIds,
        ],
        (productMap, productIds) => productIds.map((id) => productMap[id]),
      ),
    },
  });

  // ASSERT
  expect(store.getState().basket.products).toEqual([
    { id: 1, name: 'boots', price: 20 },
  ]);

  // ACT
  store.getActions().products.setProductName({
    id: 1,
    name: 'shoes',
  });

  // ASSERT
  expect(store.getState().basket.products).toEqual([
    { id: 1, name: 'shoes', price: 20 },
  ]);
});

test('computed properties are available in actions', () => {
  // ARRANGE
  const store = createStore({
    todos: ['test computed'],
    todosCount: computed((state) => state.todos.length),
    testAction: action((state) => {
      // ASSERT
      expect(state.todosCount).toBe(1);
    }),
  });

  // ACT
  store.getActions().testAction();
});

test('computed properties work in a React component', () => {
  // ARRANGE
  let renderCount = 0;
  function Product({ id }) {
    const product = useStoreState((state) => state.products.itemMap[id]);
    renderCount += 1;
    return <div data-testid="name">{product.name}</div>;
  }

  const store = createStore({
    products: {
      items: [{ id: 1, name: 'boots' }],
      itemMap: computed([(state) => state.items], (items) =>
        items.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {}),
      ),
      setProductName: action((state, payload) => {
        const product = state.items.find((p) => p.id === payload.id);
        product.name = payload.name;
      }),
    },
    other: {
      foo: 'bar',
      setFoo: action((state) => {
        state.foo = 'bar';
      }),
    },
  });

  const app = (
    <StoreProvider store={store}>
      <Product id={1} />
    </StoreProvider>
  );

  // ACT
  const { getByTestId } = render(app);

  // ASSERT
  expect(getByTestId('name').textContent).toBe('boots');
  expect(renderCount).toBe(1);

  // ACT
  act(() => {
    store.getActions().products.setProductName({
      id: 1,
      name: 'shoes',
    });
  });

  // ASSERT
  expect(store.getState().products.items).toEqual([{ id: 1, name: 'shoes' }]);
  expect(getByTestId('name').textContent).toBe('shoes');

  expect(renderCount).toBe(2);

  // ACT
  act(() => {
    store.getActions().products.setProductName({
      id: 1,
      name: 'shoes',
    });
  });

  // ASSERT
  expect(getByTestId('name').textContent).toBe('shoes');
  expect(renderCount).toBe(2);

  // ACT
  act(() => {
    store.getActions().other.setFoo('qux');
  });

  // ASSERT
  expect(getByTestId('name').textContent).toBe('shoes');
  expect(renderCount).toBe(2);
});

test('computed properties accessing others in React component', () => {
  // ARRANGE
  let renderCount = 0;
  function Basket() {
    const products = useStoreState((state) => state.basket.products);
    renderCount += 1;
    return (
      <div data-testid="products">{products.map((x) => x.name).join(', ')}</div>
    );
  }

  const store = createStore({
    products: {
      items: [
        { id: 1, name: 'boots', price: 20 },
        { id: 2, name: 'shirt', price: 50 },
      ],
      itemMap: computed([(state) => state.items], (items) =>
        items.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {}),
      ),
      setProductName: action((state, payload) => {
        const product = state.items.find((p) => p.id === payload.id);
        product.name = payload.name;
      }),
    },
    basket: {
      productIds: [1],
      products: computed(
        [
          (state, storeState) => storeState.products.itemMap,
          (state) => state.productIds,
        ],
        (productMap, productIds) => productIds.map((id) => productMap[id]),
      ),
      addProductToBasket: action((state, payload) => {
        state.productIds.push(payload);
      }),
      property: 'foo',
      setProperty: action((state, payload) => {
        state.property = payload;
      }),
    },
  });

  const app = (
    <StoreProvider store={store}>
      <Basket />
    </StoreProvider>
  );

  // ACT
  const { getByTestId } = render(app);

  // ASSERT
  expect(getByTestId('products').textContent).toBe('boots');
  expect(renderCount).toBe(1);

  // ACT
  act(() => {
    store.getActions().basket.addProductToBasket(2);
  });

  // ASSERT
  expect(getByTestId('products').textContent).toBe('boots, shirt');
  expect(renderCount).toBe(2);

  // ACT
  act(() => {
    store.getActions().basket.setProperty('bar');
  });

  // ASSERT
  expect(getByTestId('products').textContent).toBe('boots, shirt');
  expect(renderCount).toBe(2);
});

test('nested computed properties', () => {
  const model = {
    items: {
      1: 'foo',
    },

    nested: {
      numbers: [1, 2, 3],
      filteredNumbers: computed((state) =>
        state.numbers.filter((number) => number > 1),
      ),
    },

    // selectors
    list: computed([(state) => state.items], (items) => Object.values(items)),

    // ACTions
    fetched: action((state, payload) => {
      state.nested.numbers = payload;
      state.items['1'] = 'bar';
    }),
  };

  const store = createStore(model);

  // ACT
  store.getActions().fetched([4, 5, 6]);

  // ASSERT
  expect(store.getState().nested.filteredNumbers).toEqual([4, 5, 6]);
  expect(store.getState().list).toEqual(['bar']);
});

test('updating nested state', () => {
  const model = {
    items: {
      1: { id: 1, text: 'foo' },
    },

    nested: {
      numbers: [1, 2, 3],
      reset: action((state) => {
        state.numbers = [5];
      }),
    },

    list: computed([(state) => state.items], (items) => Object.values(items)),
  };

  const store = createStore(model);

  // ACT
  store.getActions().nested.reset();

  // ASSERT
  expect(store.getState().nested.numbers).toEqual([5]);
  expect(store.getState().list).toEqual([{ id: 1, text: 'foo' }]);
});

test('writes to a computed property are ignored', () => {
  // ARRANGE
  const store = createStore({
    items: ['oi'],
    count: computed((state) => state.items.length),
    naughtyAction: action((state) => {
      state.count = 10;
    }),
  });

  // ASSERT
  expect(store.getState().count).toBe(1);

  // ACT
  store.getActions().naughtyAction();

  // ASSERT
  expect(store.getState().count).toBe(1);
});

test('computed properties operate against their original store state', () => {
  // ARRANGE
  const store = createStore({
    items: ['one'],
    count: computed((state) => state.items.length),
    addItem: action((state, payload) => {
      state.items.push(payload);
    }),
  });

  const stateAtAPointInTime = store.getState();

  // ASSERT
  expect(stateAtAPointInTime.count).toBe(1);

  // ACT
  store.getActions().addItem('two');

  // ASSERT
  expect(stateAtAPointInTime.count).toBe(1);
  expect(store.getState().count).toBe(2);
});
