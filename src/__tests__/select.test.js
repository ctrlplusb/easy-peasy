import { action, createStore, select } from '../index';

test('is run for initialisation of store', () => {
  // arrange
  const selector = jest.fn();
  selector.mockImplementation(state =>
    Object.keys(state.items).map(key => state.items[key]),
  );
  // act
  const store = createStore({
    items: { 1: { text: 'foo' } },
    itemList: select(selector),
  });
  // assert
  const actual = store.getState().itemList;
  expect(actual).toEqual([{ text: 'foo' }]);
  expect(selector).toHaveBeenCalledTimes(1);
});

test('executes one only if state does not change', () => {
  // arrange
  let callCount = 0;
  const store = createStore({
    items: { 1: { text: 'foo' } },
    itemList: select(state => {
      callCount += 1;
      return Object.keys(state.items).map(key => state.items[key]);
    }),
    doNothing: action(() => undefined),
  });
  // act
  store.dispatch.doNothing();
  // assert
  const actual = store.getState().itemList;
  expect(actual).toEqual([{ text: 'foo' }]);
  expect(callCount).toBe(1);

  // act
  store.dispatch.doNothing();

  // assert
  expect(callCount).toBe(1);
});

test('executes again if state does change', () => {
  // arrange
  const selector = jest.fn();
  selector.mockImplementation(state =>
    Object.keys(state.items).map(key => state.items[key]),
  );
  const store = createStore({
    items: { 1: { text: 'foo' } },
    itemList: select(selector),
    doSomething: action(state => {
      state.items[2] = { text: 'bar' };
    }),
  });
  // act
  store.dispatch.doSomething();
  // assert
  const actual = store.getState().itemList;
  expect(actual).toEqual([{ text: 'foo' }, { text: 'bar' }]);
  expect(selector).toHaveBeenCalledTimes(2);
});

test('executes if parent action changes associated state', () => {
  // arrange
  const selector = jest.fn();
  selector.mockImplementation(state =>
    Object.keys(state.items).map(key => state.items[key]),
  );
  const store = createStore({
    todos: {
      items: { 1: { text: 'foo' } },
      itemList: select(selector),
    },
    doSomething: action(state => {
      state.todos.items[2] = { text: 'bar' };
    }),
  });
  // act
  store.dispatch.doSomething();
  // assert
  const actual = store.getState().todos.itemList;
  expect(actual).toEqual([{ text: 'foo' }, { text: 'bar' }]);
  expect(selector).toHaveBeenCalledTimes(2);
});

test('root select', () => {
  // arrange
  const selector = jest.fn();
  selector.mockImplementation(state =>
    Object.keys(state.todos.items).map(key => state.todos.items[key]),
  );
  const store = createStore({
    todos: {
      items: { 1: { text: 'foo' } },
    },
    itemList: select(selector),
    doSomething: action(state => {
      state.todos.items[2] = { text: 'bar' };
    }),
  });
  // act
  store.dispatch.doSomething();
  // assert
  const actual = store.getState().itemList;
  expect(actual).toEqual([{ text: 'foo' }, { text: 'bar' }]);
  expect(selector).toHaveBeenCalledTimes(2);
});

test('composed selectors', () => {
  // arrange
  const totalPriceSelector = select(state =>
    state.products.reduce((acc, cur) => acc + cur.price, 0),
  );
  const finalPriceSelector = select(
    state => state.totalPrice * ((100 - state.discount) / 100),
    [totalPriceSelector],
  );
  const store = createStore({
    discount: 25,
    products: [{ name: 'Shoes', price: 160 }, { name: 'Hat', price: 40 }],
    totalPrice: totalPriceSelector,
    finalPrice: finalPriceSelector,
    addProduct: action((state, payload) => {
      state.products.push(payload);
    }),
    changeDiscount: action((state, payload) => {
      state.discount = payload;
    }),
  });
  // assert
  expect(store.getState().finalPrice).toBe(150);
  // act
  store.dispatch.addProduct({ name: 'Socks', price: 100 });
  // assert
  expect(store.getState().finalPrice).toBe(225);
  // act
  store.dispatch.changeDiscount(50);
  // assert
  expect(store.getState().finalPrice).toBe(150);
});

test('composed selectors in reverse decleration', () => {
  // arrange
  const totalPriceSelector = select(state =>
    state.products.reduce((acc, cur) => acc + cur.price, 0),
  );
  const finalPriceSelector = select(
    state => state.totalPrice * ((100 - state.discount) / 100),
    [totalPriceSelector],
  );
  const store = createStore({
    discount: 25,
    products: [{ name: 'Shoes', price: 160 }, { name: 'Hat', price: 40 }],
    finalPrice: finalPriceSelector,
    totalPrice: totalPriceSelector,
  });
  // assert
  expect(store.getState().finalPrice).toBe(150);
});

test('supports internal auto memoised fns', () => {
  // arrange
  let callCount = 0;
  const store = createStore({
    products: [{ id: 1, name: 'Shoes' }, { id: 2, name: 'Book' }],
    productById: select(state => id => {
      callCount += 1;
      return state.products.find(x => x.id === id);
    }),
  });

  // act
  let product = store.getState().productById(1);

  // assert
  expect(product).toEqual({ id: 1, name: 'Shoes' });
  expect(callCount).toBe(1);

  // act
  product = store.getState().productById(1);

  // assert
  expect(product).toEqual({ id: 1, name: 'Shoes' });
  expect(callCount).toBe(1);

  // act
  product = store.getState().productById(2);

  // assert
  expect(product).toEqual({ id: 2, name: 'Book' });
  expect(callCount).toBe(2);

  // act
  product = store.getState().productById(1);

  // assert
  expect(product).toEqual({ id: 1, name: 'Shoes' });
  expect(callCount).toBe(2);

  // act
  product = store.getState().productById(2);

  // assert
  expect(product).toEqual({ id: 2, name: 'Book' });
  expect(callCount).toBe(2);
});

test('internal fn memoisatition can be disabled', () => {
  // arrange
  let callCount = 0;
  const store = createStore(
    {
      products: [{ id: 1, name: 'Shoes' }, { id: 2, name: 'Book' }],
      productById: select(state => id => {
        callCount += 1;
        return state.products.find(x => x.id === id);
      }),
    },
    {
      disableInternalSelectFnMemoize: true,
    },
  );

  // act
  let product = store.getState().productById(1);

  // assert
  expect(product).toEqual({ id: 1, name: 'Shoes' });
  expect(callCount).toBe(1);

  // act
  product = store.getState().productById(1);

  // assert
  expect(product).toEqual({ id: 1, name: 'Shoes' });
  expect(callCount).toBe(2);
});
