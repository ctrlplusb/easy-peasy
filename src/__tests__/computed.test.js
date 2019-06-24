import React from 'react';
import { act } from 'react-dom/test-utils';
import produce from 'immer-peasy';
import { render } from '@testing-library/react';
import {
  createStore,
  computed,
  action,
  thunk,
  useStoreState,
  StoreProvider,
} from '../index';

test('immer-peasy works as expected', () => {
  const original = {
    firstName: 'Bob',
    lastName: 'Fruits',
  };

  // act
  Object.defineProperty(original, 'fullName', {
    get: () => original.firstName + ' ' + original.lastName,
  });

  // assert
  expect(original.fullName).toBe('Bob Fruits');

  // act
  const immerNoUpdate = produce(original, draft => draft);

  // assert
  expect(immerNoUpdate).toBe(original);

  const newState = {
    ...original,
    firstName: 'Mary',
  };

  // assert
  expect(newState.fullName).toBe(undefined);
  // We expect the getter property to be undefined. In our internals we will
  // always remap computed props

  // act
  const immerWithUpdate = produce(original, draft => {
    draft.firstName = 'Mary';
  });

  // assert
  expect(immerWithUpdate).not.toBe(original);
  expect(immerWithUpdate.firstName).toBe('Mary');
  expect(immerWithUpdate.fullName).toBe(undefined);
});

test('defining and accessing a computed property', () => {
  // arrange
  const store = createStore({
    firstName: 'Mary',
    lastName: 'Poppins',
    fullName: computed((firstName, lastName) => `${firstName} ${lastName}`, [
      state => state.firstName,
      state => state.lastName,
    ]),
  });

  // act
  expect(store.getState().fullName).toBe('Mary Poppins');
});

test('computed properties are memoized', () => {
  // arrange
  let computedCount = 0;

  const store = createStore({
    firstName: 'Mary',
    lastName: 'Poppins',
    fullName: computed(
      (firstName, lastName) => {
        computedCount += 1;
        return `${firstName} ${lastName}`;
      },
      [state => state.firstName, state => state.lastName],
    ),
    setFirstName: action((state, payload) => {
      state.firstName = payload;
    }),
  });

  // assert
  expect(computedCount).toBe(0);

  // act
  store.getState().fullName;

  // assert
  expect(computedCount).toBe(1);

  // act
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
    fullName: computed(state => `${state.firstName} ${state.lastName}`),
  });

  // assert
  expect(store.getState().fullName).toBe('Mary Poppins');
});

test('computed properties can access global state', () => {
  // arrange
  const store = createStore({
    products: {
      items: [{ id: 1, name: 'boots', price: 20 }],
      itemMap: computed(
        items => items.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {}),
        [state => state.items],
      ),
      setProductName: action((state, payload) => {
        const product = state.items.find(p => p.id === payload.id);
        product.name = payload.name;
      }),
    },
    basket: {
      productIds: [1],
      products: computed(
        (productMap, productIds) => productIds.map(id => productMap[id]),
        [
          (state, storeState) => storeState.products.itemMap,
          state => state.productIds,
        ],
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
    todosCount: computed(state => state.todos.length),
    testAction: action((state, payload) => {
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
    const product = useStoreState(state => state.products.itemMap[id], [id]);
    renderCount += 1;
    return <div data-testid="name">{product.name}</div>;
  }

  const store = createStore({
    products: {
      items: [{ id: 1, name: 'boots' }],
      itemMap: computed(
        items => items.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {}),
        [state => state.items],
      ),
      setProductName: action((state, payload) => {
        const product = state.items.find(p => p.id === payload.id);
        product.name = payload.name;
      }),
    },
    other: {
      foo: 'bar',
      setFoo: action((state, payload) => {
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
    const products = useStoreState(state => state.basket.products);
    renderCount += 1;
    return (
      <div data-testid="products">{products.map(x => x.name).join(', ')}</div>
    );
  }

  const store = createStore({
    products: {
      items: [
        { id: 1, name: 'boots', price: 20 },
        { id: 2, name: 'shirt', price: 50 },
      ],
      itemMap: computed(
        items => items.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {}),
        [state => state.items],
      ),
      setProductName: action((state, payload) => {
        const product = state.items.find(p => p.id === payload.id);
        console.log(product);
        product.name = payload.name;
      }),
    },
    basket: {
      productIds: [1],
      products: computed(
        (productMap, productIds) => productIds.map(id => productMap[id]),
        [
          (state, storeState) => storeState.products.itemMap,
          state => state.productIds,
        ],
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
      filteredNumbers: computed(state => {
        return state.numbers.filter(number => number > 1);
      }),
    },

    // selectors
    list: computed(items => Object.values(items), [state => state.items]),

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
      reset: action(state => {
        state.numbers = [];
      }),
    },

    list: computed(items => Object.values(items), [state => state.items]),
  };

  const store = createStore(model);

  // act
  store.getActions().nested.reset();

  // assert
  expect(store.getState().nested.numbers).toEqual([]);
  expect(store.getState().list).toEqual([{ id: 1, text: 'foo' }]);
});
