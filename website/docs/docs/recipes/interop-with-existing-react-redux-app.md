# Interop with an existing React Redux application

This recipe will guide you through the process of integrating Easy Peasy into your existing React Redux application. It is possible to slowly migrate an existing React Redux application to Easy Peasy without doing a full rewrite. 

Easy Peasy outputs a standard Redux store, and allows customisation of the store via the [StoreConfig](/docs/api/store-config.html). Therefore it is possible to configure the Easy Peasy redux store to match the needs of your existing application. You will likely be able to move your store into Easy Peasy without the need to make any changes to your components.

This would grant you the ability to slowly and carefully refactor your existing React Redux reducers into Easy Peasy models when needed, though there is nothing preventing you from keeping the concepts (Easy Peasy models, and React Redux reducers) living side by side indefinitely.

## Refactoring the creation of your store

Imagine you had a Redux store being configured similarly to the following.

```javascript
import { createStore, combineReducers, applyMiddleware } from 'redux';
import productsReducer from './reducers/products';
import basketReducer from './reducers/basket';
import loggerMiddleware from './middleware/logger';

const rootReducer = combineReducers({
  products: productsReducer,
  basket: basketReducer
});

const store = createStore(rootReducer, applyMiddleware(loggerMiddleware));

export default store;
```

You could refactor this into an Easy Peasy store like so.

```javascript
import { createStore, reducer } from 'easy-peasy';  // 👈 import from easy peasy
import productsReducer from './reducers/products';
import basketReducer from './reducers/basket';
import loggerMiddleware from './middleware/logger';

const model = {
  // Instead of doing a combineReducers we just bind each reducer to a key
  // of our model using the "reducer" API from Easy Peasy
  products: reducer(productsReducer),
  basket: reducer(basketReducer),

  // We can then add any Easy Peasy models we like too
  victory: {
    msg: 'Easy Peasy + Redux harmony ❤️',
    updateMsg: action((state, payload) => {
      state.msg = payload;
    })
  }
};

const store = createStore(model, {
  middleware: [loggerMiddleware]
});

export default store;
```

> Note: Easy Peasy already includes the `redux-thunk` middleware under the hood, so there is no need for you to explicitly configure this library as a middleware.

Once you have done that your application should perform exactly the same way it did before.

## Using Easy Peasy hooks and React Redux connect

If you would like to use both Easy Peasy's hooks, and React Redux's connect you will need to wrap your application with the provider component from both libraries.

```javascript
import { Provider } from 'react-redux';
import { StoreProvider } from 'easy-peasy';
import store from './store';

const app = (
  <Provider store={store}>
    <StoreProvider store={store}>
      <App />
    </StoreProvider>
  </Provider>
);
```
