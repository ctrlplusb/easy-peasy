import { createStore, StoreProvider, Model, model } from 'easy-peasy';
import { Provider } from 'react-redux';

type StoreModel = Model<{
  foo: string;
}>;

const storeModel = model<StoreModel>({
  foo: 'bar',
});

const store = createStore(storeModel);

const app = (
  <StoreProvider store={store}>
    <Provider store={store}>
      <div />
    </Provider>
  </StoreProvider>
);
