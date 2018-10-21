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
  const { store, actions } = easyPeasy(model)

  // assert
  expect(store.getState()).toEqual({
    session: {
      user: undefined,
    },
  })

  // act
  actions.session.login({
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
  const { store, actions } = easyPeasy(model)

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
  actions.session.settings.setFavouriteColor('blue')

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
      login: async (state, data, actions) => {
        state.foo = 'bar' // should be noop
        expect(data).toEqual({
          username: 'bob',
          password: 'foo',
        })
        state.qux = 'quux' // should be noop
        const user = await Promise.resolve({ name: 'bob' })
        actions.loginSucceeded(user)
      },
    },
  }

  // act
  const { store, actions } = easyPeasy(model)

  // act
  await actions.session.login({
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
