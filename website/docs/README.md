---
pageClass: homepage
---

<p align="center">
  <img src="./assets/happy-peas.png" width="300" />
</p>
<h1 class="title" align="center">Easy Peasy state for React</h1>

Easy Peasy provides you with an <strong>intuitive</strong> API to <strong>quickly</strong> and <strong>easily</strong> manage the state for your React application. Batteries are included - <strong>no configuration</strong> is required to support derived state, API calls, performance optimisation, developer tools etc.

<p>&nbsp;</p>

Is mapStateToProps and dispatch confusing you?, you are spending a lot of time trying to implement state
management in your application?. Hustle no more. State management is something really hard to learn and there are alot of avenues to take but with Easy Peasy your life have been made simple. It's as easy as 1 2 3. 

**Should I choose Easy Peasy for my state management.**

The answer is yes. As compared to setting up state management using react-redux, Its much easier using Easy peasy and here is why;

 * No need to connect every component that needs to know about the app state or having to mapStateToProps 
 * No need to create all the confusing files reducers, actions, store configurations root reducers etc. 
 * Less code to implement state management in your application as compared to setting up redux from scratch.
 * Syntax is very easy to go about.


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

**Step 2 - Wrap you application**

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

<p class="action"><a href="/docs/tutorial/" class="action-button">Get Started →</a></p>
