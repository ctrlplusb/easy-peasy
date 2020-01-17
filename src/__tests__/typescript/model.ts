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

interface AddressModel {
  street: string;
  postCode: string;
  setAddress: Action<AddressModel, string>;
}

const addressModel = model<AddressModel>({
  street: 'foo',
  postCode: 'bar',
  setAddress: action((state, payload) => {
    state.street = payload;
  }),
});

interface UserModel {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  age: Computed<UserModel, number>;
  address: Model<AddressModel>;
  profile: {
    [key: string]: string;
  };
  archivedData: {
    address: Model<AddressModel>;
  };
}

const userModel = model<UserModel>({
  firstName: '',
  age: computed(() => 15),
  dateOfBirth: new Date(),
  lastName: '',
  address: addressModel,
  profile: {},
});

interface StoreModel {
  user: Model<UserModel>;
}

const storeModel = model<StoreModel>({
  user: userModel,
});

const store = createStore(storeModel);

store.getState().user.address.street;
store.getState().user.profile;
store.getState().user;
store.getActions().user.address.setAddress('foo');
