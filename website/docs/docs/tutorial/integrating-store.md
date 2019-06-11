## Integrating the store

In order to expose the [store](/api/store) to your React application you need to wrap your application with the [StoreProvider](/api/store-provider) component, providing the store to it as a prop.

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

Any components nested within the [StoreProvider](/api/store-provider) will now have the [store](/api/store) exposed to them.