import {
  action,
  listen,
  Listen,
  createStore,
  thunk,
  Thunk,
  Action,
} from 'easy-peasy'

type Injections = {
  id: 1337
}

type UserModel = {
  login: Thunk<UserModel, { username: string; password: string }>
  logout: Action<UserModel, boolean>
}

type AuditModel = {
  logs: string[]
  log: Action<AuditModel, string>
  userListeners: Listen<AuditModel, Injections, StoreModel>
}

type StoreModel = {
  user: UserModel
  audit: AuditModel
}

const userModel: UserModel = {
  login: thunk((dispatch, payload) => {}),
  logout: action((state, payload) => {}),
}

createStore<StoreModel>({
  user: userModel,
  audit: {
    logs: [],
    log: action((state, payload) => {}),
    userListeners: listen(on => {
      on(
        userModel.login,
        thunk((actions, payload, helpers) => {
          const { dispatch, getState, injections, meta } = helpers
          actions.log('Logged in ' + payload.username)
          getState().audit.logs
          dispatch.audit.log('Foo')
          injections.id + 7331
          meta.parent.concat(meta.path)
        }),
      )
      on(
        userModel.logout,
        thunk((actions, payload, helpers) => {
          const { dispatch, getState, injections, meta } = helpers
          actions.log('Logged out ' + payload ? 'hard' : 'soft')
          getState().audit.logs
          dispatch.audit.log('Foo')
          injections.id + 7331
          meta.parent.concat(meta.path)
        }),
      )
      on(
        'ROUTE_CHANGED',
        thunk((actions, payload) => {
          actions.log('Route changed')
        }),
      )
      on(
        userModel.login,
        action((state, payload) => {
          state.logs.push('Logged in ' + payload.username)
        }),
      )
      on(
        'ROUTE_CHANGED',
        action((state, payload: string) => {
          state.logs.push(`Route changed: ${payload}`)
        }),
      )
    }),
  },
})
