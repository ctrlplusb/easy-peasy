import { Provider } from 'react-redux';
import { createStore, StoreProvider } from 'easy-peasy';

interface StoreModel {
  foo: string;
}

const store = createStore<StoreModel>({
  foo: 'bar',
});

const app = (
  <StoreProvider store={store}>
    <Provider store={store}>
      <div />
    </Provider>
  </StoreProvider>
);
