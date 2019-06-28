---
pageClass: homepage
---

<p align="center">
  <img src="./assets/happy-peas.png" width="300" />
</p>
<h1 class="title" align="center">Easy Peasy state for React</h1>

Easy Peasy provides you with an <strong>intuitive</strong> API to <strong>quickly</strong> and <strong>easily</strong> manage the state for your React application. Batteries are included - <strong>no configuration</strong> is required to support derived state, API calls, performance optimisation, developer tools etc.

<p>&nbsp;</p>

**Step 1 - Create your store**

```javascript
const store = createStore({
  todos: {
    items: ['Create store', 'Wrap application', 'Use store'],
    add: action((state, payload) => {
      state.items.push(payload)
    })
  }
});
```

**Step 2 - Wrap your application**

```javascript
function App() {
  return (
    <StoreProvider store={store}>
      <TodoList />
    </StoreProvider>
  );
}
```

**Step 3 - Use the store**

```javascript
function TodoList() {
  const todos = useStoreState(state => state.todos.items)
  const add = useStoreActions(actions => actions.todos.add)
  return (
    <div>
      {todos.map((todo, idx) => <div key={idx}>{todo}</div>)}
      <AddTodo onAdd={add} />
    </div>
  )
}
```

## Features

  - Zero configuration
  - No boilerplate
  - React hooks to use store within components
  - Thunks for data fetching and side effects
  - Computed properties - i.e. derived data
  - Immutable data store under the hood
  - Includes robust Typescript definitions
  - Global, shared, or component level stores
  - React Native supported
  - Includes APIs to aid testing
  - Redux Dev Tools support preconfigured
  - Supports Redux middleware

<p class="action">
  <a href="/docs/introduction/quick-start" class="action-button">Quick Start</a>
  <a href="/docs/tutorial/" class="action-button">Full Tutorial</a>
</p>
