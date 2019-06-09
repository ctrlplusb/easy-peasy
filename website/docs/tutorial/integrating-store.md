# Integrating the store

In order to integrate and expose the store to your React application you need to
wrap your application with the `StoreProvider` component, providing the store to
it as a prop.

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

Any components nested within the `StoreProvider` will now have the store exposed
to them.