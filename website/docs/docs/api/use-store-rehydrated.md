# useStoreRehydrated

This hook is useful when making use of the [persist](/docs/api/persist.html) API along with an asynchronous storage engine.

When you rehydrate a persisted state from an asynchronous storage engine you may experience a flash of content where your application initially renders based on your stores default state, and then when the asynchronous operation to retrieve the state completes your application rerenders with the rehydrated state.

To improve your user's experience you can utilise this hook to get the status of the rehydration. Utilising the rehydration status flag allows you to conditionally render a loading state.

## Example

In the example below, the `<Main />` content will not render until our store has been successfully updated with the rehydration state.

```javascript
import { useStoreRehydrated } from 'easy-peasy';

const store = createStore(persist(model, { storage: asyncStorageEngine });

function App() {
  const rehydrated = useStoreRehydrated();
  return (
    <div>
      <Header />
      {rehydrated ? <Main /> : <div>Loading...</div>}
      <Footer />
    </div>
  )
}

ReactDOM.render(
  <StoreProvider store={store}>
    <App />
  </StoreProvider>,
  document.getElementById('app')
);
```
