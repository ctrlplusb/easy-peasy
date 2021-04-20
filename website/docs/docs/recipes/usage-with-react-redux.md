# Usage with react-redux

As Easy Peasy outputs a standard Redux store, so it is entirely possible to use Easy Peasy with the official [`react-redux`](https://github.com/reduxjs/react-redux) package.

This allows you to do a few things:

- Slowly migrate a legacy application that is built using `react-redux`
- Connect your store to Class components via `useDispatch and useSelectors`

**1. First, install the `react-redux` package**

```bash
npm install react-redux
```

**2. Then wrap your app with the `Provider`**

```javascript
import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'easy-peasy';
import { Provider } from 'react-redux'; // 👈 import the provider
import model from './model';
import TodoList from './components/TodoList';

// 👇 then create your store
const store = createStore(model);

const App = () => (
  // 👇 then pass it to the Provider
  <Provider store={store}>
    <TodoList />
  </Provider>
);

render(<App />, document.querySelector('#app'));
```

**3. Finally, use `useSelector` and `useDispatch` against your components**

```javascript
import React from 'react';
import { useSelector, useStoreActions } from "./model"; // 👈 For connecting the store with the components and dispatching actions

const TodoList = ({ todos, addTodo }) => {
  const todos = useSelector(state => state.todos.items);
  const addTodo = useStoreActions(dispatch => dispatch.todos.addTodo);
  
  return (
    <div>
      {todos.map(({ id, text }) => 
        <Todo key={id} text={text} />
      )}
      <AddTodo onSubmit={addTodo} />
    </div>
  );
}

export default TodoList;
```
