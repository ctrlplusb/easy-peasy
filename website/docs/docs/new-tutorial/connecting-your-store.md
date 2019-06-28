# Connecting your store

In order to connect your [store](/docs/api/store) to your application you need to use our [StoreProvider](/docs/api/store-provider) component. Simply wrap your application with the component, providing your [store](/docs/api/store) instance to it.

## Wrapping your application

Firstly, we will import the [StoreProvider](/docs/api/store-provider) and our [store](/docs/api/store) instance.

```javascript
import { StoreProvider } from 'easy-peasy';
import store from './store';
```

Then we wrap our application.

```javascript
ReactDOM.render(
  <StoreProvider store={store}>
    <App />
  </StoreProvider>,
  rootElement
);
```

## Application Progress

Awesome, the [store](/docs/api/store) is now exposed to our application components.

Next up we will refactor our components to consume the state from the store.

You can view the progress of our application refactor [here](https://codesandbox.io/s/easy-peasy-tutorial-connect-store-x8j25);