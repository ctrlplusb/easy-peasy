---
pageClass: homepage
---

> Howdy 👋
>
> We have a release candidate (RC) for v3. 🎉
>
> v3 is aimed at being our long term support (LTS) release, with the intention to avoid breaking changes and minimise the features that we add to the library.
>
> [The website for the RC can be found here](https://easy-peasy-v3.now.sh)
>
> For those currently using v2; you can find the notes on the breaking changes included within the [v3 PR](https://github.com/ctrlplusb/easy-peasy/pull/216).

---

<p align="center">
  <img src="./assets/happy-peas.png" width="300" />
</p>
<h1 class="title" align="center">Vegetarian friendly state for React</h1>

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
  - Includes robust TypeScript definitions
  - Global, shared, or component level stores
  - React Native supported
  - Includes APIs to aid testing
  - Redux Dev Tools support preconfigured
  - Supports Redux middleware

<p class="action">
  <a href="/docs/quick-start.html" class="action-button">Quick Start</a>
  <a href="/docs/tutorial/" class="action-button">Full Tutorial</a>
</p>
