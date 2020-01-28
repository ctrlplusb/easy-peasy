/* eslint-disable */

import {
  action,
  createStore,
  EasyPeasyConfig,
  Action,
  Model,
  model,
} from 'easy-peasy';

type StoreModel = Model<{
  foo: string;
  update: Action<StoreModel, string>;
}>;

const storeModel = model<StoreModel>({
  foo: 'bar',
  update: action((state, payload) => {
    state.foo = payload;
  }),
});

const storeWithoutConfig = createStore(storeModel);

storeWithoutConfig.getMockedActions().length;
storeWithoutConfig.clearMockedActions();
storeWithoutConfig.getState().foo;
storeWithoutConfig.getActions().update('bar');

const config: EasyPeasyConfig = {
  mockActions: true,
};
const storeWithConfig = createStore(storeModel, config);

storeWithConfig.getMockedActions().length;
storeWithoutConfig.clearMockedActions();
storeWithConfig.getActions().update('bar');
