<h1 align="center">Easy Peasy state for React</h1>
<p>&nbsp;</p>
<p align="center">
  <img src="./assets/happy-peas.png" width="300" />
</p>
<p>&nbsp;</p>

```javascript
const store = createStore({
  todos: {
    items: ['Install easy-peasy', 'Define your model', 'Have fun'],
    add: action((state, payload) => {
      state.items.push(payload)
    })
  }
});

function App() {
  return (
    <StoreProvider store={store}>
      <TodoList />
    </StoreProvider>
  );
}

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


