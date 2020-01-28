/* eslint-disable */

import {
  model,
  Model,
  Computed,
  computed,
  createStore,
  Action,
  action,
} from 'easy-peasy';

type AddressModel = Model<{
  street: string;
  postCode: string;
  setAddress: Action<AddressModel, string>;
}>;

const addressModel = model<AddressModel>({
  street: 'foo',
  postCode: 'bar',
  setAddress: action((state, payload) => {
    state.street = payload;
  }),
});

type UserModel = Model<{
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  age: Computed<UserModel, number>;
  address: AddressModel;
  profile: {
    [key: string]: string;
  };
  archivedData: {
    address: AddressModel;
  };
}>;

const userModel = model<UserModel>({
  firstName: '',
  age: computed(() => 15),
  dateOfBirth: new Date(),
  lastName: '',
  address: addressModel,
  profile: {},
  archivedData: {
    address: addressModel,
  },
});

type StoreModel = Model<{
  user: Model<UserModel>;
}>;

const storeModel = model<StoreModel>({
  user: userModel,
});

const store = createStore(storeModel);

store.getState().user.address.street;
store.getState().user.profile;
store.getState().user;
store.getActions().user.address.setAddress('foo');
