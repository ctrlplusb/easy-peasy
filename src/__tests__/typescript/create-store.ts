import { createStore, EasyPeasyConfig, Action } from 'easy-peasy'

interface StoreModel {
  foo: string
  update: Action<StoreModel, string>
}

const model: StoreModel = {
  foo: 'bar',
  update: (state, payload) => {
    state.foo = payload
  },
}

const storeWithoutConfig = createStore(model)

storeWithoutConfig.dispatched.length
storeWithoutConfig.getState().foo
storeWithoutConfig.dispatch.update('bar')

const config: EasyPeasyConfig = {
  recordActions: true,
}
const storeWithConfig = createStore(model, config)

storeWithConfig.dispatched.length
storeWithConfig.getState().foo
storeWithConfig.dispatch.update('bar')
