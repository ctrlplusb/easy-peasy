/* eslint-disable no-param-reassign */

import { createStore, effect } from '../index'

const resolveAfter = (data, ms) =>
  new Promise(resolve => setTimeout(() => resolve(data), ms))

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

test('redux thunk configured', async () => {
  // arrange
  const model = {}
  const store = createStore(model)
  const action = payload => () => Promise.resolve(payload)

  // act
  const result = await store.dispatch(action('foo'))

  // assert
  expect(result).toBe('foo')
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

test('redux dev tools enabled', () => {
  // arrange
  const model = {}
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = jest.fn()

  // act
  createStore(model, {
    devTools: true,
  })

  // assert
  expect(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__).toHaveBeenCalledTimes(1)
})

test('redux dev tools disabled by default', () => {
  // arrange
  const model = {}
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = jest.fn()

  // act
  createStore(model)

  // assert
  expect(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__).not.toHaveBeenCalled()
})
