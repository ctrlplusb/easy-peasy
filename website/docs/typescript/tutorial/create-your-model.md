# Create your model

```typescript
const model: StoreModel = {
  todos: {
    items: [],
    firstItem: select(state =>
      state.items.length > 0 ? state.items[0] : undefined,
    ),
    addTodo: action((state, payload) => {
      state.items.push(payload)
    }),
  },
  user: {
    token: undefined,
    loggedIn: action((state, payload) => {
      state.token = payload
    }),
    login: effect(async (dispatch, payload) => {
      const response = await fetch('/login', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const { token } = await response.json()
      dispatch.user.loggedIn(token)
    }),
  },
  counter: reducer((state = 0, action) => {
    switch (action.type) {
      case 'COUNTER_INCREMENT':
        return state + 1
      default:
        return state
    }
  }),
}
```