# createStore

Creates a global [store](/docs/api/store.html) based on the provided model. It supports a [configuration](/docs/api/store-config.html) parameter to customise your [store's](/docs/api/store.html) behaviour.

```javascript
import { createStore } from 'easy-peasy';

const store = createStore({
  todos: {
    items: [],
  }
});
```

## Arguments

The following arguments are accepted:

  - `model` (Object, required)

    Your model representing your state tree, and optionally containing action functions.

  - `config` (Object, not required)

    Provides custom configuration options for your store. Please see the [StoreConfig](/docs/api/store-config.html) API documentation for a full list of configuration options.

## Returns

When executed, you will receive a [store](/docs/api/store.html) instance back. Please refer to the [docs](/docs/api/store.html) for details of the store's API.

Once you have a store you provide it to the [StoreProvider](/docs/api/store-provider.html) in order to expose it to your application.

## Example

This example shows a full store implementation.

```javascript
import { createStore, StoreProvider, action } from 'easy-peasy';

const model = {
  todos: {
    items: [],
    addTodo: action((state, text) => {
      state.items.push(text)
    })
  },
};

const store = createStore(model, {
  name: 'MyAwesomeStore'
});

ReactDOM.render(
  <StoreProvider store={store}>
    <App />
  </StoreProvider>,
  document.querySelector('#app')
);
```
