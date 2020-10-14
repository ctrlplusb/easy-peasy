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

test('patched immer works as expected', () => {
  const original = {
    firstName: 'Bob',
    lastName: 'Fruits',
  };

  let getterCallCount = 0;

  // act
  Object.defineProperty(original, 'fullName', {
    enumerable: true,
    get: () => {
      getterCallCount += 1;
      return `${original.firstName} ${original.lastName}`;
    },
  });

  // assert
  expect(original.fullName).toBe('Bob Fruits');
  expect(getterCallCount).toBe(1);

  // act
  const immerNoUpdate = produce(original, (draft) => draft);

  // assert
  expect(immerNoUpdate).toBe(original);
  expect(getterCallCount).toBe(2);

  const newState = {
    ...original,
    firstName: 'Mary',
  };

  // assert
  expect(newState.fullName).toBe('Bob Fruits');
  expect(getterCallCount).toBe(3);

  // act
  const immerWithUpdate = produce(original, (draft) => {
    draft.firstName = 'Mary';
  });

  // assert
  expect(immerWithUpdate).not.toBe(original);
  expect(immerWithUpdate.firstName).toBe('Mary');
  expect(immerWithUpdate.fullName).toBe('Bob Fruits');
  expect(getterCallCount).toBe(4);
});

test('defining and accessing a computed property', () => {
  // arrange
  const store = createStore({
    firstName: 'Mary',
    lastName: 'Poppins',
    fullName: computed(
      [(state) => state.firstName, (state) => state.lastName],
      (firstName, lastName) => `${firstName} ${lastName}`,
    ),
  });

  // act
  expect(store.getState().fullName).toBe('Mary Poppins');
});

test('computed properties immediately available in an action', () => {
  // arrange
  const store = createStore({
    firstName: 'Mary',
    lastName: 'Poppins',
    fullName: computed((state) => `${state.firstName} ${state.lastName}`),
    anAction: action((state) => {
      // assert
      expect(state.fullName).toBe('Mary Poppins');
    }),
  });

  // act
  store.getActions().anAction();
});

test('can spread computed', () => {
  // arange
  const store = createStore({
    firstName: 'Mary',
    lastName: 'Poppins',
    fullName: computed((state) => `${state.firstName} ${state.lastName}`),
  });

  // act
  const myState = { ...store.getState() };

  // assert
  expect(myState.fullName).toBe('Mary Poppins');
});

test('computed properties are memoized', () => {
  // arrange
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

  // assert
  expect(computedCount).toBe(0);

  // act
  // eslint-disable-next-line no-unused-expressions
  store.getState().fullName;

  // assert
  expect(computedCount).toBe(1);

  // act
  // eslint-disable-next-line no-unused-expressions
  store.getState().fullName;

  // assert
  expect(computedCount).toBe(1);

  // act
  store.getActions().setFirstName('Bob');

  // assert
  expect(store.getState().fullName).toBe('Bob Poppins');
  expect(computedCount).toBe(2);

  // act
  store.getActions().setFirstName('Bob');

  // assert
  expect(store.getState().fullName).toBe('Bob Poppins');
  expect(computedCount).toBe(2);
});

it('state resolvers are optional', () => {
  // arrange
  const store = createStore({
    firstName: 'Mary',
    lastName: 'Poppins',
    fullName: computed((state) => `${state.firstName} ${state.lastName}`),
  });

  // assert
  expect(store.getState().fullName).toBe('Mary Poppins');
});

test('computed properties can access global state', () => {
  // arrange
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

  // assert
  expect(store.getState().basket.products).toEqual([
    { id: 1, name: 'boots', price: 20 },
  ]);

  // act
  store.getActions().products.setProductName({
    id: 1,
    name: 'shoes',
  });

  // assert
  expect(store.getState().basket.products).toEqual([
    { id: 1, name: 'shoes', price: 20 },
  ]);
});

test('computed properties are available in actions', () => {
  // arrange
  const store = createStore({
    todos: ['test computed'],
    todosCount: computed((state) => state.todos.length),
    testAction: action((state) => {
      // assert
      expect(state.todosCount).toBe(1);
    }),
  });

  // act
  store.getActions().testAction();
});

test('computed properties work in a React component', () => {
  // arrange
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

  // act
  const { getByTestId } = render(app);

  // assert
  expect(getByTestId('name').textContent).toBe('boots');
  expect(renderCount).toBe(1);

  // act
  act(() => {
    store.getActions().products.setProductName({
      id: 1,
      name: 'shoes',
    });
  });

  // assert
  expect(store.getState().products.items).toEqual([{ id: 1, name: 'shoes' }]);
  expect(getByTestId('name').textContent).toBe('shoes');

  expect(renderCount).toBe(2);

  // act
  act(() => {
    store.getActions().products.setProductName({
      id: 1,
      name: 'shoes',
    });
  });

  // assert
  expect(getByTestId('name').textContent).toBe('shoes');
  expect(renderCount).toBe(2);

  // act
  act(() => {
    store.getActions().other.setFoo('qux');
  });

  // assert
  expect(getByTestId('name').textContent).toBe('shoes');
  expect(renderCount).toBe(2);
});

test('computed properties accessing others in React component', () => {
  // arrange
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

  // act
  const { getByTestId } = render(app);

  // assert
  expect(getByTestId('products').textContent).toBe('boots');
  expect(renderCount).toBe(1);

  // act
  act(() => {
    store.getActions().basket.addProductToBasket(2);
  });

  // assert
  expect(getByTestId('products').textContent).toBe('boots, shirt');
  expect(renderCount).toBe(2);

  // act
  act(() => {
    store.getActions().basket.setProperty('bar');
  });

  // assert
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
      filteredNumbers: computed((state) => {
        return state.numbers.filter((number) => number > 1);
      }),
    },

    // selectors
    list: computed([(state) => state.items], (items) => Object.values(items)),

    // actions
    fetched: action((state, payload) => {
      state.nested.numbers = payload;
      state.items['1'] = 'bar';
    }),
  };

  const store = createStore(model);

  // act
  store.getActions().fetched([4, 5, 6]);

  // assert
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

  // act
  store.getActions().nested.reset();

  // assert
  expect(store.getState().nested.numbers).toEqual([5]);
  expect(store.getState().list).toEqual([{ id: 1, text: 'foo' }]);
});

test('writes to a computed property are ignored', () => {
  // arrange
  const store = createStore({
    items: ['oi'],
    count: computed((state) => state.items.length),
    naughtyAction: action((state) => {
      state.count = 10;
    }),
  });

  // assert
  expect(store.getState().count).toBe(1);

  // act
  store.getActions().naughtyAction();

  // assert
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
