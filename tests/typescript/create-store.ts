import { action, createStore, EasyPeasyConfig, Action } from 'easy-peasy';

interface StoreModel {
  foo: string;
  update: Action<StoreModel, string>;
}

const model: StoreModel = {
  foo: 'bar',
  update: action((state, payload) => {
    state.foo = payload;
  }),
};

const storeWithoutConfig = createStore(model);

storeWithoutConfig.getMockedActions().length;
storeWithoutConfig.clearMockedActions();
storeWithoutConfig.getState().foo;
storeWithoutConfig.getActions().update('bar');

const config: EasyPeasyConfig = {
  mockActions: true,
};
const storeWithConfig = createStore(model, config);

storeWithConfig.getMockedActions().length;
storeWithoutConfig.clearMockedActions();
storeWithConfig.getActions().update('bar');
