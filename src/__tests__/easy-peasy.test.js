/* eslint-disable no-param-reassign */
/* eslint-disable react/prop-types */

import 'jest-dom/extend-expect'
import React from 'react'
import { render, cleanup, fireEvent } from 'react-testing-library'

import {
  createStore,
  effect,
  reducer,
  select,
  StoreProvider,
  useStore,
  useAction,
} from '../index'

const resolveAfter = (data, ms) =>
  new Promise(resolve => setTimeout(() => resolve(data), ms))

beforeEach(() => {
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = undefined
})

afterEach(cleanup)

const trackActionsMiddleware = () => {
  const middleware = () => next => action => {
    middleware.actions.push(action)
    return next(action)
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
    const app2 = (
      <StoreProvider store={store}>
        <Values id={2} />
      </StoreProvider>
    )
    rerender(app2)

    // assert
    expect(value.firstChild.textContent).toBe('foo')

    // We have to flush the change with an extra render
    rerender(app2)

    // ensure settimeouts fire
    jest.runAllTimers()

    // assert
    expect(value.firstChild.textContent).toBe('bar')
  })

  test('store subscribe is only called once', () => {
    // arrange
    const store = createStore({
      count: 1,
      inc: state => {
        state.count += 1
      },
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
    const { rerender } = render(app)

    // this triggers the effect to fire
    rerender(app)

    // assert
    expect(renderSpy).toBeCalledTimes(1)
    expect(store.subscribe).toBeCalledTimes(1)

    // act
    store.dispatch.inc()

    // ensure settimeouts fire
    jest.runAllTimers()

    // assert
    expect(renderSpy).toBeCalledTimes(2)
    expect(store.subscribe).toBeCalledTimes(1)
  })

  test('store is unsubscribed on unmount', () => {
    // arrange
    const store = createStore({
      count: 1,
      inc: state => {
        state.count += 1
      },
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

    // ensure settimeouts fire
    jest.runAllTimers()

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
        inc: state => {
          state.count += 1
        },
      })
      const renderSpy = jest.fn()
      function Counter() {
        const count = useStore(state => state.count)
        const inc = useAction(actions => actions.inc)
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
      const { getByTestId, rerender } = render(app)

      // this triggers the effect to fire
      rerender(app)

      // assert
      const countButton = getByTestId('count')
      expect(countButton.firstChild.textContent).toBe('1')
      expect(renderSpy).toHaveBeenCalledTimes(1)

      // act
      fireEvent.click(countButton)

      // ensure settimeouts fire
      jest.runAllTimers()

      // assert
      expect(countButton.firstChild.textContent).toBe('2')
      expect(renderSpy).toHaveBeenCalledTimes(2)
    })

    test('component only updates with state change', () => {
      // arrange
      const store = createStore({
        count: 1,
        somethingElse: null,
        updateSomethingElse: (state, payload) => {
          state.somethingElse = payload
        },
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
      const { getByTestId, rerender } = render(app)

      // this triggers the effect to fire
      rerender(app)

      // assert
      const countButton = getByTestId('count')
      expect(countButton.firstChild.textContent).toBe('1')
      expect(renderSpy).toHaveBeenCalledTimes(1)

      // act
      store.dispatch.updateSomethingElse('foo')

      // ensure settimeouts fire
      jest.runAllTimers()

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
        inc: state => {
          state.count += 1
        },
      })
      const renderSpy = jest.fn()
      function Counter() {
        const { count } = useStore(state => ({
          count: state.count,
        }))
        const inc = useAction(actions => actions.inc)
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
      const { getByTestId, rerender } = render(app)

      // this triggers the effect to fire
      rerender(app)

      // assert
      const countButton = getByTestId('count')
      expect(countButton.firstChild.textContent).toBe('1')
      expect(renderSpy).toHaveBeenCalledTimes(1)

      // act
      fireEvent.click(countButton)

      // ensure settimeouts fire
      jest.runAllTimers()

      // assert
      expect(countButton.firstChild.textContent).toBe('2')
      expect(renderSpy).toHaveBeenCalledTimes(2)
    })

    test('component only updates with state change', () => {
      // arrange
      const store = createStore({
        count: 1,
        somethingElse: null,
        updateSomethingElse: (state, payload) => {
          state.somethingElse = payload
        },
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
      const { getByTestId, rerender } = render(app)

      // this triggers the effect to fire
      rerender(app)

      // assert
      const countButton = getByTestId('count')
      expect(countButton.firstChild.textContent).toBe('1')
      expect(renderSpy).toHaveBeenCalledTimes(1)

      // act
      store.dispatch.updateSomethingElse('foo')

      // ensure settimeouts fire
      jest.runAllTimers()

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
        login: (state, user) => {
          state.user = user
        },
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
          setFavouriteColor: (state, color) => {
            state.favouriteColor = color
          },
        },
        login: () => undefined,
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
      doSomething: state => {
        state.todos.items[2] = { text: 'bar' }
      },
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
        login: (state, user) => {
          state.user = user
        },
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
    const customMiddleware = () => next => action => {
      // assert
      expect(action.type).toBe('@action.logFullState')
      next(action)
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
    const wrappedEffect = fn =>
      effect(async (dispatch, payload, additional) => {
        try {
          return await fn(dispatch, payload, additional)
        } catch (err) {
          dispatch.error.unexpectedError(err)
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
        initialised: state => {
          state.isInitialised = true
        },
        initialise: wrappedEffect(async dispatch => {
          dispatch.session.initialised()
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
    const action = payload => () => Promise.resolve(payload)
    // act
    const result = await store.dispatch(action('foo'))
    // assert
    expect(result).toBe('foo')
  })
})

describe('effects', () => {
  test('dispatches an action to represent the start of an effect', async () => {
    // arrange
    const model = {
      foo: {
        doSomething: effect(() => undefined),
      },
    }
    const trackActions = trackActionsMiddleware()
    const store = createStore(model, { middleware: [trackActions] })
    const payload = 'hello'
    // act
    await store.dispatch.foo.doSomething(payload)
    // assert
    expect(trackActions.actions).toEqual([
      { type: '@effect.foo.doSomething', payload },
    ])
  })

  test('async action', async () => {
    // arrange
    const model = {
      session: {
        user: undefined,
        loginSucceeded: (state, payload) => {
          state.user = payload
        },
        login: effect(async (dispatch, payload) => {
          expect(payload).toEqual({
            username: 'bob',
            password: 'foo',
          })
          const user = await resolveAfter({ name: 'bob' }, 15)
          dispatch.session.loginSucceeded(user)
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

  test('action is always promise chainable', done => {
    // arrange
    const model = { doSomething: effect(() => undefined) }
    const store = createStore(model)
    // act
    store.dispatch.doSomething().then(done)
  })

  test('dispatch another branch action', async () => {
    // arrange
    const model = {
      session: {
        user: undefined,
        login: effect(dispatch => {
          dispatch.stats.incrementLoginAttempts()
        }),
      },
      stats: {
        loginAttempts: 0,
        incrementLoginAttempts: state => {
          state.loginAttempts += 1
        },
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
      doSomething: effect((dispatch, payload, getState) => {
        // assert
        expect(getState()).toEqual({ count: 1 })
      }),
    })

    // act
    await store.dispatch.doSomething()
  })

  test('deprecated getState is exposed', async () => {
    // arrange
    const store = createStore({
      count: 1,
      doSomething: effect((dispatch, payload, { getState }) => {
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
        doSomething: effect((dispatch, payload, getState, injections, meta) => {
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
    const selector = jest.fn()
    selector.mockImplementation(state =>
      Object.keys(state.items).map(key => state.items[key]),
    )
    const store = createStore({
      items: { 1: { text: 'foo' } },
      itemList: select(selector),
      doNothing: () => undefined,
    })
    // act
    store.dispatch.doNothing()
    // assert
    const actual = store.getState().itemList
    expect(actual).toEqual([{ text: 'foo' }])
    expect(selector).toHaveBeenCalledTimes(1)
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
      doSomething: state => {
        state.items[2] = { text: 'bar' }
      },
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
      doSomething: state => {
        state.todos.items[2] = { text: 'bar' }
      },
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
      doSomething: state => {
        state.todos.items[2] = { text: 'bar' }
      },
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
      addProduct: (state, payload) => {
        state.products.push(payload)
      },
      changeDiscount: (state, payload) => {
        state.discount = payload
      },
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
})

describe('dependency injection', () => {
  test('exposes dependencies to effect actions', async () => {
    // arrange
    const injection = jest.fn()
    const store = createStore(
      {
        doSomething: effect((dispatch, payload, getState, injections) => {
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
      counter: reducer((state = 1, action) => {
        if (action.type === 'INCREMENT') {
          return state + 1
        }
        return state
      }),
      foo: {
        bar: 'baz',
        update: state => {
          state.bar = 'bob'
        },
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
        counter: reducer((state = 1, action) => {
          if (action.type === 'INCREMENT') {
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
