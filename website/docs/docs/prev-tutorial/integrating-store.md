# Integrating the store

In order to expose the [store](/docs/api/store) to your React application you need to wrap your application with the [StoreProvider](/docs/api/store-provider) component, providing the [store](/docs/api/store) to it as a prop.

```javascript
import { StoreProvider, createStore } from 'easy-peasy';
import model from './model'

const store = createStore(model);

ReactDOM.render(
  <StoreProvider store={store}>
    <App />
  </StoreProvider>,
  document.querySelector('#app')
);
```

Any components nested within the [StoreProvider](/docs/api/store-provider) will now have the [store](/docs/api/store) exposed to them.