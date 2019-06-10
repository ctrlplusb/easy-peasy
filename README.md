<p>&nbsp;</p>
<p align='center'>
  <img src="https://i.imgur.com/UnPLVly.png" width="280" />
</p>
<p align='center'>Easy peasy state for React</p>
<p>&nbsp;</p>

[![npm](https://img.shields.io/npm/v/easy-peasy.svg?style=flat-square)](http://npm.im/easy-peasy)
[![MIT License](https://img.shields.io/npm/l/easy-peasy.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/ctrlplusb/easy-peasy.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/easy-peasy)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/easy-peasy.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/easy-peasy)

```javascript
import { action, createStore, StoreProvider, useStoreState, useStoreActions } from 'easy-peasy';

const store = createStore({
  todos: {
    items: ['Install easy-peasy', 'Define your model', 'Have fun'],
    add: action((state, payload) => {
      state.items.push(payload)
    })
  }
});

const App = () => (
  <StoreProvider store={store}>
    <TodoList />
  </StoreProvider>
)

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

## Highlights

  - React hooks based API
  - Simple, intuitive API focusing on speed of development
  - Thunks for data fetching and side effects
  - Selectors for derived data
  - Global, shared, or component level stores
  - Immutable data store under the hood
  - Typescript definitions baked in
  - React Native supported
  - Testing helpers baked in
  - Wraps Redux, all the radness, without the boilerplate
  - Redux Dev Tools support built in
  - Supports Redux middleware and enhancers

## Introduction

Easy Peasy provides you with an intuitive and easy to use API allowing you to quickly and easily build the state for your React application. Batteries are included - you don't need to configure any additional packages to support derived state, API calls, memoisation, etc.

Under the hood we are abstracting Redux. Most complaints directed at Redux are typically in reference to the boilerplate associated with it. Easy Peasy provides you with a mechanism to avoid the boilerplate whilst taking advantage of the amazing guarantees that the Redux architecture provides.

We support the Redux Dev Tools out of the box and output a Redux store allowing interop with existing libraries. In addition to this we even allow extension of the underlying Redux store via middleware and enhancers. This provides the opportunity to integrate existing Redux libraries.

That all been said, absolutely no Redux experience is required to use Easy Peasy.

## Documentation

The [official website](https://easy-peasy.now.sh) contains all the tutorials and documentation you will need to get started.