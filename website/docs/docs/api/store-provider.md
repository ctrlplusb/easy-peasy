# StoreProvider

This component is responsible for exposing your [store](/docs/api/store.html) to
your React application. This ensures that any of the store hooks within your
application have access to the store.

Really important stuff here. :)

## Example

```javascript
import { StoreProvider, createStore } from 'easy-peasy';
import model from './model';

const store = createStore(model);

function App() {
  return (
    <StoreProvider store={store}>
      <TodoList />
    </StoreProvider>
  );
}
```
