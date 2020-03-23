---
pageClass: homepage
---

<p align="center">
  <img src="./assets/happy-peas.png" width="300" />
</p>
<h1 class="title" align="center">Vegetarian friendly state for React</h1>

Easy Peasy provides you with an <strong>intuitive</strong> API to <strong>quickly</strong> and <strong>easily</strong> manage the state for your React application. Batteries are included - <strong>no configuration</strong> is required to support derived state, API calls, developer tools etc.

<p>&nbsp;</p>

```bash
npm install easy-peasy
```

<p>&nbsp;</p>

**Step 1 - Create your store**

```javascript
const store = createStore({
  todos: ['Create store', 'Wrap application', 'Use store'],
  addTodo: action((state, payload) => {
    state.add.push(payload)
  })
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
  const todos = useStoreState(state => state.todos);
  const addTodo = useStoreActions(actions => actions.addTodo);
  return (
    <div>
      {todos.map((todo, idx) => <div key={idx}>{todo}</div>)}
      <AddTodo onAdd={addTodo} />
    </div>
  );
}
```

## Features

  - Zero configuration
  - No boilerplate
  - React hooks based API
  - Computed properties - i.e. derived data
  - Data fetching / side effects
  - Persist state to session/local storage
  - Testing helpers
  - Extensive TypeScript support
  - Global, shared, or component level stores
  - React Native supported
  - Redux Dev Tools supported
  - Hot Reloading supported

<p class="action">
  <a href="/docs/quick-start.html" class="action-button">Quick Start</a>
</p>
