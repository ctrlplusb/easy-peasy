# Exposing the store to our application

In order to expose the [store](/docs/api/store) to our React application we need to wrap our application with the [StoreProvider](/docs/api/store-provider) component, providing the [store](/docs/api/store) instance to it.

```javascript
import { StoreProvider } from 'easy-peasy';
//           👆 import the provider component

import store from './store' // 👈 import our store instance

ReactDOM.render(
  // Wrap our application with the StoreProvider, providing it the store instance
  //  👇                 👇
  <StoreProvider store={store}>
    <App />
  </StoreProvider>,
  document.querySelector('#app')
);
```

Our application's components will now be able to interact with our [store](/docs/api/store).

## Demo Application

You can view the progress of our demo application [here](#).
