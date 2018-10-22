/* eslint-disable no-param-reassign */

import easyPeasy from '../index'

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
  const store = easyPeasy(model)

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
  const store = easyPeasy(model)

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

test('async action', async () => {
  // arrange
  const model = {
    session: {
      user: undefined,
      loginSucceeded: (state, payload) => {
        state.user = payload
      },
      login: async (state, data, { dispatchLocal }) => {
        state.foo = 'bar' // should be noop
        expect(data).toEqual({
          username: 'bob',
          password: 'foo',
        })
        state.qux = 'quux' // should be noop
        const user = await Promise.resolve({ name: 'bob' })
        dispatchLocal.loginSucceeded(user)
      },
    },
  }

  // act
  const store = easyPeasy(model)

  // act
  await store.dispatch.session.login({
    username: 'bob',
    password: 'foo',
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
  const store = easyPeasy(model)

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
  window.__REDUX_DEVTOOLS_EXTENSION__ = jest.fn()

  // act
  easyPeasy(model)

  // assert
  expect(window.__REDUX_DEVTOOLS_EXTENSION__).toHaveBeenCalledTimes(1)
})
