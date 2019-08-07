# StoreProvider

Exposes the [store](/docs/api/store.html) to your React application, so that your components will be able to consume and interact with the [store](/docs/api/store.html) via the hooks.

## Example

```javascript
import { StoreProvider, createStore } from 'easy-peasy';
import model from './model'

const store = createStore(model);

function App() {
  return (
    <StoreProvider store={store}>
      <TodoList />
    </StoreProvider>
  );
}
```
