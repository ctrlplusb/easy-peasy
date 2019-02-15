/* eslint-disable no-param-reassign */
/* eslint-disable react/prop-types */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, fireEvent } from 'react-testing-library'

import {
  action,
  createStore,
  createTypedHooks,
  listen,
  reducer,
  select,
  StoreProvider,
  thunk,
  useActions,
  useDispatch,
  useStore,
} from '../index'

const resolveAfter = (data, ms) =>
  new Promise(resolve => setTimeout(() => resolve(data), ms))

beforeEach(() => {
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = undefined
})

const trackActionsMiddleware = () => {
  const middleware = () => next => _action => {
    middleware.actions.push(_action)
    return next(_action)
  }
  middleware.actions = []
  return middleware
}

describe('react', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('exposes dispatch', () => {
    // arrange
    const store = createStore({ foo: 'bar' })

    function MyComponent() {
      const dispatch = useDispatch()
      // assert
      expect(dispatch).toBe(store.dispatch)
      return null
    }

    // act
    render(
      <StoreProvider store={store}>
        <MyComponent />
      </StoreProvider>,
    )
  })

  test('maps state when prop dependency changes', async () => {
    // arrange
    const store = createStore({
      values: {
        1: 'foo',
        2: 'bar',
      },
    })
    function Values({ id }) {
      const value = useStore(state => state.values[id], [id])
      return <span data-testid="value">{value}</span>
    }
    const app = (
      <StoreProvider store={store}>
        <Values id={1} />
      </StoreProvider>
    )

    // act
    const { getByTestId, rerender } = render(app)

    // assert
    const value = getByTestId('value')
    expect(value.firstChild.textContent).toBe('foo')

    // act
    rerender(
      <StoreProvider store={store}>
        <Values id={2} />
      </StoreProvider>,
    )

    // assert
    expect(value.firstChild.textContent).toBe('bar')
  })

  test('store subscribe is only called once', () => {
    // arrange
    const store = createStore({
      count: 1,
      inc: action(state => {
        state.count += 1
      }),
    })
    jest.spyOn(store, 'subscribe')
    const renderSpy = jest.fn()
    function Counter() {
      const count = useStore(state => state.count)
      renderSpy()
      return <span data-testid="count">{count}</span>
    }
    const app = (
      <StoreProvider store={store}>
        <Counter />
      </StoreProvider>
    )

    // act
    render(app)

    // assert
    expect(renderSpy).toBeCalledTimes(1)
    expect(store.subscribe).toBeCalledTimes(1)

    // act
    act(() => {
      store.dispatch.inc()
    })

    // assert
    expect(renderSpy).toBeCalledTimes(2)
    expect(store.subscribe).toBeCalledTimes(1)
  })

  test('store is unsubscribed on unmount', () => {
    // arrange
    const store = createStore({
      count: 1,
      inc: action(state => {
        state.count += 1
      }),
    })
    const unsubscribeSpy = jest.fn()
    store.subscribe = () => unsubscribeSpy
    function Counter() {
      const count = useStore(state => state.count)
      return <span data-testid="count">{count}</span>
    }
    const app = (
      <StoreProvider store={store}>
        <Counter />
      </StoreProvider>
    )

    // act
    const { unmount } = render(app)

    // assert
    expect(unsubscribeSpy).toBeCalledTimes(0)

    // act
    store.dispatch.inc()

    // assert
    expect(unsubscribeSpy).toBeCalledTimes(0)

    // act
    unmount()

    // assert
    expect(unsubscribeSpy).toBeCalledTimes(1)
  })

  describe('direct form', () => {
    test('component updates with state change', () => {
      // arrange
      const store = createStore({
        count: 1,
        inc: action(state => {
          state.count += 1
        }),
      })
      const renderSpy = jest.fn()
      function Counter() {
        const count = useStore(state => state.count)
        const inc = useActions(actions => actions.inc)
        renderSpy()
        return (
          <button data-testid="count" type="button" onClick={inc}>
            {count}
          </button>
        )
      }

      const app = (
        <StoreProvider store={store}>
          <Counter />
        </StoreProvider>
      )

      // act
      const { getByTestId } = render(app)

      // assert
      const countButton = getByTestId('count')
      expect(countButton.firstChild.textContent).toBe('1')
      expect(renderSpy).toHaveBeenCalledTimes(1)

      // act
      fireEvent.click(countButton)

      // assert
      expect(countButton.firstChild.textContent).toBe('2')
      expect(renderSpy).toHaveBeenCalledTimes(2)
    })

    test('component only updates with state change', () => {
      // arrange
      const store = createStore({
        count: 1,
        somethingElse: null,
        updateSomethingElse: action((state, payload) => {
          state.somethingElse = payload
        }),
      })
      const renderSpy = jest.fn()
      function Counter() {
        const count = useStore(state => state.count)
        renderSpy()
        return <span data-testid="count">{count}</span>
      }
      const app = (
        <StoreProvider store={store}>
          <Counter />
        </StoreProvider>
      )

      // act
      const { getByTestId } = render(app)

      // assert
      const countButton = getByTestId('count')
      expect(countButton.firstChild.textContent).toBe('1')
      expect(renderSpy).toHaveBeenCalledTimes(1)

      // act
      store.dispatch.updateSomethingElse('foo')

      // assert
      expect(countButton.firstChild.textContent).toBe('1')
      expect(renderSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('object form', () => {
    test('component updates with state change', () => {
      // arrange
      const store = createStore({
        count: 1,
        inc: action(state => {
          state.count += 1
        }),
      })
      const renderSpy = jest.fn()
      function Counter() {
        const { count } = useStore(state => ({
          count: state.count,
        }))
        const inc = useActions(actions => actions.inc)
        renderSpy()
        return (
          <button data-testid="count" type="button" onClick={inc}>
            {count}
          </button>
        )
      }

      const app = (
        <StoreProvider store={store}>
          <Counter />
        </StoreProvider>
      )

      // act
      const { getByTestId } = render(app)

      // assert
      const countButton = getByTestId('count')
      expect(countButton.firstChild.textContent).toBe('1')
      expect(renderSpy).toHaveBeenCalledTimes(1)

      // act
      fireEvent.click(countButton)

      // assert
      expect(countButton.firstChild.textContent).toBe('2')
      expect(renderSpy).toHaveBeenCalledTimes(2)
    })

    test('component only updates with state change', () => {
      // arrange
      const store = createStore({
        count: 1,
        somethingElse: null,
        updateSomethingElse: action((state, payload) => {
          state.somethingElse = payload
        }),
      })
      const renderSpy = jest.fn()
      function Counter() {
        const { count } = useStore(state => ({
          count: state.count,
        }))
        renderSpy()
        return <span data-testid="count">{count}</span>
      }
      const app = (
        <StoreProvider store={store}>
          <Counter />
        </StoreProvider>
      )

      // act
      const { getByTestId } = render(app)

      // assert
      const countButton = getByTestId('count')
      expect(countButton.firstChild.textContent).toBe('1')
      expect(renderSpy).toHaveBeenCalledTimes(1)

      // act
      act(() => {
        store.dispatch.updateSomethingElse('foo')
      })

      // assert
      expect(countButton.firstChild.textContent).toBe('1')
      expect(renderSpy).toHaveBeenCalledTimes(1)
    })
  })
})

describe('store', () => {
  test('empty object in state', () => {
    // arrange
    const model = {
      todos: {
        items: {},
        foo: [],
      },
      bar: null,
    }
    // act
    const store = createStore(model)
    // assert
    expect(store.getState()).toEqual({
      todos: {
        items: {},
        foo: [],
      },
      bar: null,
    })
  })

  test('basic features', () => {
    // arrange
    const model = {
      session: {
        user: undefined,
        login: action((state, user) => {
          state.user = user
        }),
      },
    }
    // act
    const store = createStore(model)
    // assert
    expect(store.getState()).toEqual({
      session: {
        user: undefined,
      },
    })
    // act
    store.dispatch.session.login({
      name: 'bob',
    })
    // assert
    expect(store.getState()).toEqual({
      session: {
        user: {
          name: 'bob',
        },
      },
    })
  })

  test('nested action', () => {
    // arrange
    const model = {
      session: {
        user: undefined,
        settings: {
          favouriteColor: 'red',
          setFavouriteColor: action((state, color) => {
            state.favouriteColor = color
          }),
        },
        login: action(() => undefined),
      },
    }
    // act
    const store = createStore(model)
    // assert
    expect(store.getState()).toEqual({
      session: {
        user: undefined,
        settings: {
          favouriteColor: 'red',
        },
      },
    })
    // act
    store.dispatch.session.settings.setFavouriteColor('blue')
    // assert
    expect(store.getState()).toEqual({
      session: {
        user: undefined,
        settings: {
          favouriteColor: 'blue',
        },
      },
    })
  })

  test('root action', () => {
    // arrange
    const store = createStore({
      todos: {
        items: { 1: { text: 'foo' } },
      },
      doSomething: action(state => {
        state.todos.items[2] = { text: 'bar' }
      }),
    })
    // act
    store.dispatch.doSomething()
    // assert
    const actual = store.getState().todos.items
    expect(actual).toEqual({ 1: { text: 'foo' }, 2: { text: 'bar' } })
  })

  test('state with no actions', () => {
    // arrange
    const model = {
      session: {
        user: undefined,
        login: action((state, user) => {
          state.user = user
        }),
      },
      // No associated actions here
      todos: {
        foo: [],
      },
    }
    // act
    const store = createStore(model)
    // act
    store.dispatch.session.login({
      name: 'bob',
    })
    // assert
    expect(store.getState()).toEqual({
      session: {
        user: {
          name: 'bob',
        },
      },
      todos: {
        foo: [],
      },
    })
  })

  test('allows custom middleware', done => {
    // arrange
    const customMiddleware = () => next => _action => {
      // assert
      expect(_action.type).toMatch(/@thunk.logFullState\((started|completed)\)/)
      next(_action)
      done()
    }
    // act
    const store = createStore({}, { middleware: [customMiddleware] })
    store.dispatch.logFullState()
  })

  test('supports initial state', () => {
    // arrange
    const model = {
      foo: {
        bar: {
          stuff: [1, 2],
        },
        color: 'red',
      },
      baz: 'bob',
    }
    const initialState = {
      foo: {
        bar: {
          stuff: [3, 4],
          invalid: 'qux',
        },
      },
    }
    // act
    const store = createStore(model, { initialState })
    // assert
    expect(store.getState()).toEqual({
      foo: {
        bar: {
          stuff: [3, 4],
        },
        color: 'red',
      },
      baz: 'bob',
    })
  })

  test('complex configuration', async () => {
    const wrappedThunk = fn =>
      thunk(async (actions, payload, helpers) => {
        try {
          return await fn(actions, payload, helpers)
        } catch (err) {
          helpers.dispatch.error.unexpectedError(err)
          return undefined
        }
      })

    const store = createStore({
      error: {
        hasError: select(state => !!state.message),
        message: undefined,
      },
      session: {
        isInitialised: false,
        initialised: action(state => {
          state.isInitialised = true
        }),
        initialise: wrappedThunk(async actions => {
          actions.initialised()
          return 'done'
        }),
      },
    })

    const result = await store.dispatch.session.initialise()
    expect(store.getState().session.isInitialised).toBe(true)
    expect(result).toBe('done')
  })
})

describe('internals', () => {
  test('redux thunk configured', async () => {
    // arrange
    const model = { foo: 'bar' }
    const store = createStore(model)
    const thunkAction = payload => () => Promise.resolve(payload)
    // act
    const result = await store.dispatch(thunkAction('foo'))
    // assert
    expect(result).toBe('foo')
  })
})

describe('thunks', () => {
  test('dispatches an action to represent the start and end of an thunk', async () => {
    // arrange
    const model = {
      foo: {
        counter: 0,
        increment: action(state => {
          state.counter += 1
        }),
        doSomething: thunk(actions => {
          actions.increment()
          return 'did something'
        }),
      },
    }
    const trackActions = trackActionsMiddleware()
    const store = createStore(model, { middleware: [trackActions] })
    const payload = 'hello'
    // act
    const actualResult = await store.dispatch.foo.doSomething(payload)
    // assert
    expect(trackActions.actions).toEqual([
      { type: '@thunk.foo.doSomething(started)', payload },
      { type: '@action.foo.increment', payload: undefined },
      { type: '@thunk.foo.doSomething(completed)', payload },
    ])
    expect(actualResult).toBe('did something')
  })

  test('fails a thunk when error is thrown', async () => {
    // arrange
    const model = {
      foo: {
        error: thunk(() => {
          return Promise.reject(Error('error'))
        }),
        doSomething: thunk(async actions => {
          await actions.error()
          return 'did something'
        }),
      },
    }
    const trackActions = trackActionsMiddleware()
    const store = createStore(model, { middleware: [trackActions] })
    const payload = 'hello'
    try {
      // act
      await store.dispatch.foo.doSomething(payload)

      // assert
      expect(trackActions.actions).toEqual([
        { type: '@thunk.foo.doSomething(started)', payload },
        { type: '@thunk.foo.error(started)', payload: undefined },
        { type: '@thunk.foo.error(failed)', payload: undefined },
        { type: '@thunk.foo.doSomething(failed)', payload },
      ])
    } catch (e) {
      expect(e).toEqual(Error('error'))
    }
  })

  test('async', async () => {
    // arrange
    const model = {
      session: {
        user: undefined,
        loginSucceeded: action((state, payload) => {
          state.user = payload
        }),
        login: thunk(async (actions, payload, { getState }) => {
          expect(payload).toEqual({
            username: 'bob',
            password: 'foo',
          })
          const user = await resolveAfter({ name: 'bob' }, 15)
          actions.loginSucceeded(user)
          expect(getState()).toEqual({
            session: {
              user: {
                name: 'bob',
              },
            },
          })
          return 'resolved'
        }),
      },
    }
    // act
    const store = createStore(model)
    // act
    const result = await store.dispatch.session.login({
      username: 'bob',
      password: 'foo',
    })
    // assert
    expect(result).toBe('resolved')
    expect(store.getState()).toEqual({
      session: {
        user: {
          name: 'bob',
        },
      },
    })
  })

  test('is always promise chainable', done => {
    // arrange
    const model = { doSomething: thunk(() => undefined) }
    const store = createStore(model)
    // act
    store.dispatch.doSomething().then(done)
  })

  test('dispatch another branch action', async () => {
    // arrange
    const model = {
      session: {
        user: undefined,
        login: thunk((actions, payload, { dispatch }) => {
          dispatch.stats.incrementLoginAttempts()
        }),
      },
      stats: {
        loginAttempts: 0,
        incrementLoginAttempts: action(state => {
          state.loginAttempts += 1
        }),
      },
    }
    // act
    const store = createStore(model)
    // act
    await store.dispatch.session.login()
    // assert
    expect(store.getState()).toEqual({
      session: {
        user: undefined,
      },
      stats: {
        loginAttempts: 1,
      },
    })
  })

  test('getState is exposed', async () => {
    // arrange
    const store = createStore({
      count: 1,
      doSomething: thunk((dispatch, payload, { getState }) => {
        // assert
        expect(getState()).toEqual({ count: 1 })
      }),
    })

    // act
    await store.dispatch.doSomething()
  })

  test('meta values are exposed', async () => {
    // arrange
    let actualMeta
    const store = createStore({
      foo: {
        doSomething: thunk((dispatch, payload, { meta }) => {
          actualMeta = meta
        }),
      },
    })

    // act
    await store.dispatch.foo.doSomething()

    // assert
    expect(actualMeta).toEqual({
      parent: ['foo'],
      path: ['foo', 'doSomething'],
    })
  })

  test('injections are exposed', async () => {
    // arrange
    const injections = { foo: 'bar' }
    let actualInjections
    const store = createStore(
      {
        foo: {
          doSomething: thunk((dispatch, payload, helpers) => {
            actualInjections = helpers.injections
          }),
        },
      },
      {
        injections,
      },
    )

    // act
    await store.dispatch.foo.doSomething()

    // assert
    expect(actualInjections).toEqual(injections)
  })
})

describe('dev tools', () => {
  test('redux dev tools disabled', () => {
    // arrange
    const model = { foo: 'bar' }
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = jest.fn()
    // act
    createStore(model, {
      devTools: false,
    })
    // assert
    expect(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__).not.toHaveBeenCalled()
  })

  test('redux dev tools enabled by default', () => {
    // arrange
    const model = { foo: 'bar' }
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = jest.fn()
    // act
    createStore(model)
    // assert
    expect(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__).toHaveBeenCalledTimes(1)
  })
})

describe('select', () => {
  test('is run for initialisation of store', () => {
    // arrange
    const selector = jest.fn()
    selector.mockImplementation(state =>
      Object.keys(state.items).map(key => state.items[key]),
    )
    // act
    const store = createStore({
      items: { 1: { text: 'foo' } },
      itemList: select(selector),
    })
    // assert
    const actual = store.getState().itemList
    expect(actual).toEqual([{ text: 'foo' }])
    expect(selector).toHaveBeenCalledTimes(1)
  })

  test('executes one only if state does not change', () => {
    // arrange
    let callCount = 0
    const store = createStore({
      items: { 1: { text: 'foo' } },
      itemList: select(state => {
        callCount += 1
        return Object.keys(state.items).map(key => state.items[key])
      }),
      doNothing: action(() => undefined),
    })
    // act
    store.dispatch.doNothing()
    // assert
    const actual = store.getState().itemList
    expect(actual).toEqual([{ text: 'foo' }])
    expect(callCount).toBe(1)

    // act
    store.dispatch.doNothing()

    // assert
    expect(callCount).toBe(1)
  })

  test('executes again if state does change', () => {
    // arrange
    const selector = jest.fn()
    selector.mockImplementation(state =>
      Object.keys(state.items).map(key => state.items[key]),
    )
    const store = createStore({
      items: { 1: { text: 'foo' } },
      itemList: select(selector),
      doSomething: action(state => {
        state.items[2] = { text: 'bar' }
      }),
    })
    // act
    store.dispatch.doSomething()
    // assert
    const actual = store.getState().itemList
    expect(actual).toEqual([{ text: 'foo' }, { text: 'bar' }])
    expect(selector).toHaveBeenCalledTimes(2)
  })

  test('executes if parent action changes associated state', () => {
    // arrange
    const selector = jest.fn()
    selector.mockImplementation(state =>
      Object.keys(state.items).map(key => state.items[key]),
    )
    const store = createStore({
      todos: {
        items: { 1: { text: 'foo' } },
        itemList: select(selector),
      },
      doSomething: action(state => {
        state.todos.items[2] = { text: 'bar' }
      }),
    })
    // act
    store.dispatch.doSomething()
    // assert
    const actual = store.getState().todos.itemList
    expect(actual).toEqual([{ text: 'foo' }, { text: 'bar' }])
    expect(selector).toHaveBeenCalledTimes(2)
  })

  test('root select', () => {
    // arrange
    const selector = jest.fn()
    selector.mockImplementation(state =>
      Object.keys(state.todos.items).map(key => state.todos.items[key]),
    )
    const store = createStore({
      todos: {
        items: { 1: { text: 'foo' } },
      },
      itemList: select(selector),
      doSomething: action(state => {
        state.todos.items[2] = { text: 'bar' }
      }),
    })
    // act
    store.dispatch.doSomething()
    // assert
    const actual = store.getState().itemList
    expect(actual).toEqual([{ text: 'foo' }, { text: 'bar' }])
    expect(selector).toHaveBeenCalledTimes(2)
  })

  test('composed selectors', () => {
    // arrange
    const totalPriceSelector = select(state =>
      state.products.reduce((acc, cur) => acc + cur.price, 0),
    )
    const finalPriceSelector = select(
      state => state.totalPrice * ((100 - state.discount) / 100),
      [totalPriceSelector],
    )
    const store = createStore({
      discount: 25,
      products: [{ name: 'Shoes', price: 160 }, { name: 'Hat', price: 40 }],
      totalPrice: totalPriceSelector,
      finalPrice: finalPriceSelector,
      addProduct: action((state, payload) => {
        state.products.push(payload)
      }),
      changeDiscount: action((state, payload) => {
        state.discount = payload
      }),
    })
    // assert
    expect(store.getState().finalPrice).toBe(150)
    // act
    store.dispatch.addProduct({ name: 'Socks', price: 100 })
    // assert
    expect(store.getState().finalPrice).toBe(225)
    // act
    store.dispatch.changeDiscount(50)
    // assert
    expect(store.getState().finalPrice).toBe(150)
  })

  test('composed selectors in reverse decleration', () => {
    // arrange
    const totalPriceSelector = select(state =>
      state.products.reduce((acc, cur) => acc + cur.price, 0),
    )
    const finalPriceSelector = select(
      state => state.totalPrice * ((100 - state.discount) / 100),
      [totalPriceSelector],
    )
    const store = createStore({
      discount: 25,
      products: [{ name: 'Shoes', price: 160 }, { name: 'Hat', price: 40 }],
      finalPrice: finalPriceSelector,
      totalPrice: totalPriceSelector,
    })
    // assert
    expect(store.getState().finalPrice).toBe(150)
  })

  test('supports internal auto memoised fns', () => {
    // arrange
    let callCount = 0
    const store = createStore({
      products: [{ id: 1, name: 'Shoes' }, { id: 2, name: 'Book' }],
      productById: select(state => id => {
        callCount += 1
        return state.products.find(x => x.id === id)
      }),
    })

    // act
    let product = store.getState().productById(1)

    // assert
    expect(product).toEqual({ id: 1, name: 'Shoes' })
    expect(callCount).toBe(1)

    // act
    product = store.getState().productById(1)

    // assert
    expect(product).toEqual({ id: 1, name: 'Shoes' })
    expect(callCount).toBe(1)

    // act
    product = store.getState().productById(2)

    // assert
    expect(product).toEqual({ id: 2, name: 'Book' })
    expect(callCount).toBe(2)

    // act
    product = store.getState().productById(1)

    // assert
    expect(product).toEqual({ id: 1, name: 'Shoes' })
    expect(callCount).toBe(2)

    // act
    product = store.getState().productById(2)

    // assert
    expect(product).toEqual({ id: 2, name: 'Book' })
    expect(callCount).toBe(2)
  })

  test('internal fn memoisatition can be disabled', () => {
    // arrange
    let callCount = 0
    const store = createStore(
      {
        products: [{ id: 1, name: 'Shoes' }, { id: 2, name: 'Book' }],
        productById: select(state => id => {
          callCount += 1
          return state.products.find(x => x.id === id)
        }),
      },
      {
        disableInternalSelectFnMemoize: true,
      },
    )

    // act
    let product = store.getState().productById(1)

    // assert
    expect(product).toEqual({ id: 1, name: 'Shoes' })
    expect(callCount).toBe(1)

    // act
    product = store.getState().productById(1)

    // assert
    expect(product).toEqual({ id: 1, name: 'Shoes' })
    expect(callCount).toBe(2)
  })
})

describe('dependency injection', () => {
  test('exposes dependencies to effect actions', async () => {
    // arrange
    const injection = jest.fn()
    const store = createStore(
      {
        doSomething: thunk((actions, payload, { injections }) => {
          injections.injection()
        }),
      },
      {
        injections: {
          injection,
        },
      },
    )

    // act
    await store.dispatch.doSomething()

    // assert
    expect(injection).toHaveBeenCalledTimes(1)
  })
})

describe('reducer', () => {
  it('basic', () => {
    // arrange
    const store = createStore({
      counter: reducer((state = 1, _action) => {
        if (_action.type === 'INCREMENT') {
          return state + 1
        }
        return state
      }),
      foo: {
        bar: 'baz',
        update: action(state => {
          state.bar = 'bob'
        }),
      },
    })

    // assert
    expect(store.getState().counter).toEqual(1)

    // act
    store.dispatch({ type: 'INCREMENT' })

    // assert
    expect(store.getState()).toEqual({
      counter: 2,
      foo: {
        bar: 'baz',
      },
    })
  })

  it('nested', () => {
    // arrange
    const store = createStore({
      stuff: {
        counter: reducer((state = 1, _action) => {
          if (_action.type === 'INCREMENT') {
            return state + 1
          }
          return state
        }),
      },
    })

    // act
    store.dispatch({ type: 'INCREMENT' })

    // assert
    expect(store.getState()).toEqual({
      stuff: {
        counter: 2,
      },
    })
  })

  it('with selector', () => {
    // arrange
    const store = createStore({
      products: reducer((state = [], { type, payload }) => {
        if (type === 'ADD_PRODUCT') {
          return [...state, payload]
        }
        return state
      }),
      totalPrice: select(state =>
        state.products.reduce((acc, cur) => acc + cur.price, 0),
      ),
    })

    // act
    store.dispatch({
      type: 'ADD_PRODUCT',
      payload: { name: 'Boots', price: 10 },
    })

    // assert
    expect(store.getState()).toEqual({
      products: [{ name: 'Boots', price: 10 }],
      totalPrice: 10,
    })
  })
})

describe('listen', () => {
  it('work as expected', async () => {
    // arrange
    const expectedInjections = { foo: 'bar' }

    const userModel = {
      token: '',
      logIn: thunk(() => {}),
      logOut: action(() => undefined),
    }

    const store = createStore(
      {
        doNothing: action(() => undefined),
        user: userModel,
        audit: {
          logs: [],
          add: action((state, payload) => {
            state.logs.push(payload)
          }),
          userListeners: listen(on => {
            on(
              userModel.logIn,
              thunk(
                (
                  actions,
                  payload,
                  { dispatch, getState, meta, injections },
                ) => {
                  expect(payload).toEqual({ username: 'foo', password: 'bar' })
                  expect(getState()).toEqual({
                    user: {
                      token: '',
                    },
                    audit: { logs: [] },
                  })
                  expect(dispatch).toBe(store.dispatch)
                  expect(meta).toEqual({
                    parent: ['audit'],
                    path: ['audit', 'userListeners'],
                  })
                  expect(injections).toEqual(expectedInjections)
                  actions.add('User logged in')
                },
              ),
            )
            on(
              userModel.logOut,
              thunk(actions => {
                actions.add('User logged out')
              }),
            )
          }),
        },
      },
      {
        injections: expectedInjections,
      },
    )

    // act
    store.dispatch.doNothing()

    // assert
    expect(store.getState().audit.logs).toEqual([])

    // act
    await store.dispatch.user.logIn({ username: 'foo', password: 'bar' })

    const tick = ms => new Promise(resolve => setTimeout(resolve, ms))

    await tick(10)

    // assert
    expect(store.getState().audit.logs).toEqual(['User logged in'])

    // act
    await store.dispatch.user.logOut()

    // assert
    expect(store.getState().audit.logs).toEqual([
      'User logged in',
      'User logged out',
    ])
  })

  it('listeners can fire actions to update state', () => {
    // arrange
    const store = createStore({
      audit: {
        routeChangeLogs: [],
        listeners: listen(on => {
          on(
            'ROUTE_CHANGED',
            action((state, payload) => {
              state.routeChangeLogs.push(payload)
            }),
          )
        }),
      },
    })

    // act
    store.dispatch({
      type: 'ROUTE_CHANGED',
      payload: '/about',
    })

    // assert
    expect(store.getState().audit.routeChangeLogs).toEqual(['/about'])
  })

  it('listens to string actions', () => {
    // arrange
    const store = createStore({
      routeChangeLogs: [],
      log: action((state, payload) => {
        state.routeChangeLogs.push(payload)
      }),
      listeners: listen(on => {
        on(
          'ROUTE_CHANGED',
          thunk((actions, payload) => {
            actions.log(payload)
          }),
        )
      }),
    })

    // act
    store.dispatch({
      type: 'ROUTE_CHANGED',
      payload: '/about',
    })

    // assert
    expect(store.getState().routeChangeLogs).toEqual(['/about'])
  })

  it('listening to an invalid type does nothing', () => {
    // act
    createStore({
      listeners: listen(on => {
        on(true, thunk(() => {}))
      }),
    })
  })

  it('listening with an invalid handler does nothing', () => {
    // act
    createStore({
      listeners: listen(on => {
        on('FOO_BAR', true)
      }),
    })
  })
})

describe('createTypedHooks', () => {
  test('exports all hooks', () => {
    // act
    const typedHooks = createTypedHooks()

    // assert
    expect(typedHooks.useActions).toBe(useActions)
    expect(typedHooks.useStore).toBe(useStore)
    expect(typedHooks.useDispatch).toBe(useDispatch)
  })
})
