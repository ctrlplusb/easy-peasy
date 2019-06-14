# Generalising models via helpers

You may identify repeated patterns within your store implementation. It is possible to generalise these via helpers.

For example, say you had the following:

```javascript
const store = createStore({
  products: {
    data: {},
    ids: selector(
      [state => state.data],
      (resolvedState) => {
        const [data] = resolvedState;
        return Object.keys(state.data)
      }
    ),
    fetched: action((state, products) => {
      products.forEach(product => {
        state.data[product.id] = product;
      });
    }),
    fetch: thunk(async (actions) => {
      const data = await fetchProducts();
      actions.fetched(data);
    })
  },
  users: {
    data: {},
    ids: selector(
      [state => state.data],
      (resolvedState) => {
        const [data] = resolvedState;
        return Object.keys(state.data)
      }
    ),
    fetched: action((state, users) => {
      users.forEach(user => {
        state.data[user.id] = user;
      });
    }),
    fetch: thunk(async (dispatch) => {
      const data = await fetchUsers();
      actions.fetched(data);
    })
  }
})
```

You will note a distinct pattern between the `products` and `users`. You could create a generic helper like so:

```javascript
const dataModel = (endpoint) => ({
  data: {},
  ids: selector(
    [state => state.data],
    (resolvedState) => {
      const [data] = resolvedState;
      return Object.keys(state.data)
    }
  ),
  fetched: action((state, items) => {
    items.forEach(item => {
      state.data[item.id] = item;
    });
  }),
  fetch: thunk(async (actions, payload) => {
    const data = await endpoint();
    actions.fetched(data);
  })
})
```

You can then refactor the previous example to utilise this helper like so:

```javascript
const store = createStore({
  products: {
    ...dataModel(fetchProducts)
    // attach other state/actions/etc as you like
  },
  users: {
    ...dataModel(fetchUsers)
  }
})
```

This produces an implementation that is like for like in terms of functionality but far less verbose.