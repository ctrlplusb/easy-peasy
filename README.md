<p>&nbsp;</p>
<p align='center'>
  <img src="https://i.imgur.com/UnPLVly.png" width="280" />
</p>
<p align='center'>Vegetarian friendly state for React</p>
<p>&nbsp;</p>

[![npm](https://img.shields.io/npm/v/easy-peasy.svg?style=flat-square)](http://npm.im/easy-peasy)
[![MIT License](https://img.shields.io/npm/l/easy-peasy.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/ctrlplusb/easy-peasy.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/easy-peasy)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/easy-peasy.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/easy-peasy)


```
npm install easy-peasy@3.0.0-rc.5
```


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
  - React hooks based API
  - Computed properties - i.e. derived data
  - Data fetching / side effects
  - Testing helpers
  - Extensive TypeScript support
  - Global, shared, or component level stores
  - React Native supported
  - Redux Dev Tools supported
  - Hot Reloading supported

## Introduction

Easy Peasy provides you with an intuitive API to quickly and easily manage the state for your React application. Batteries are included - no configuration is required to support derived state, API calls, performance optimisation, developer tools etc.

## Documentation

See the [official website](https://easy-peasy.now.sh) for tutorials, API docs, recipes, and more.