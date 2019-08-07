# Connecting the store

In order to connect the [store](/docs/api/store.html) to our [application]((https://codesandbox.io/s/easy-peasy-tutorial-store-zgtwh)) we need to use the [StoreProvider](/docs/api/store-provider.html) component.

Simply wrap the application with the [StoreProvider](/docs/api/store-provider.html), providing the [store](/docs/api/store.html) instance to it.

## Wrapping your application

Firstly, we will import the [StoreProvider](/docs/api/store-provider.html) and our [store](/docs/api/store.html) instance.

```javascript
// src/index.js

import { StoreProvider } from 'easy-peasy';
import store from './store';
```

Then then wrap our application.

```javascript
// src/index.js

ReactDOM.render(
  <StoreProvider store={store}>
    <App />
  </StoreProvider>,
  rootElement
);
```

## Review

Awesome, the [store](/docs/api/store.html) is now exposed to the application.

Next up we will refactor our components to consume the state from the store.

You can view the progress of our application refactor [here](https://codesandbox.io/s/easy-peasy-tutorial-connect-store-1invi).